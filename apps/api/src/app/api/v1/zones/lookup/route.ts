import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'
import { z } from 'zod'

// POST /api/v1/zones/lookup - Find best branch for address
export async function POST(request: NextRequest) {
  const startTime = performance.now()

  try {
    const body = await request.json()

    // Validate input data
    const lookupSchema = Schemas.zoneLookup || z.object({
      city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
      district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters'),
      postal_code: z.string().regex(/^\d{5}$/, 'Invalid postal code format').optional(),
      neighborhood: z.string().max(50, 'Neighborhood must be less than 50 characters').optional(),
      address_line: z.string().max(255, 'Address line must be less than 255 characters').optional()
    })

    const validation = validateRequest(lookupSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid address data',
            details: validation.error
          }
        },
        { status: 400 }
      )
    }

    const { city, district, postal_code, neighborhood, address_line } = body

    // Normalize inputs (Turkish character handling)
    const normalizeText = (text: string) => {
      return text
        .trim()
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
    }

    const normalizedCity = normalizeText(city)
    const normalizedDistrict = normalizeText(district)

    // Query to find best branch/zone match
    const lookupQuery = `
      WITH zone_matches AS (
        SELECT
          z.id as zone_id,
          z.name as zone_name,
          z.branch_id,
          z.delivery_fee,
          z.estimated_delivery_time,
          z.min_order_amount,
          b.name as branch_name,
          b.address as branch_address,
          b.phone as branch_phone,
          b.email as branch_email,
          b.working_hours,

          -- Calculate match score
          CASE
            WHEN LOWER(z.city) = $1 AND LOWER(z.district) = $2 THEN 100
            WHEN LOWER(z.city) = $1 AND $3 IS NOT NULL AND $3 = ANY(z.postal_codes) THEN 95
            WHEN LOWER(z.city) = $1 THEN 80
            WHEN $4 IS NOT NULL AND LOWER($4) = LOWER(z.neighborhood) THEN 70
            ELSE 0
          END as match_score

        FROM zones z
        LEFT JOIN branches b ON z.branch_id = b.id
        WHERE z.is_active = true
        AND (b.is_active = true OR b.is_active IS NULL)
        AND (
          LOWER(z.city) = $1 AND LOWER(z.district) = $2
          OR (LOWER(z.city) = $1 AND $3 IS NOT NULL AND $3 = ANY(z.postal_codes))
          OR LOWER(z.city) = $1
        )
      )
      SELECT
        zm.*,
        -- Additional branch details
        CASE
          WHEN zm.branch_id IS NULL THEN false
          ELSE true
        END as has_branch,
        -- District validation
        EXISTS(
          SELECT 1 FROM turkish_districts td
          WHERE LOWER(td.city) = $1 AND LOWER(td.district) = $2
        ) as district_valid
      FROM zone_matches zm
      ORDER BY zm.match_score DESC, zm.delivery_fee ASC
      LIMIT 1
    `

    const result = await pool.query(lookupQuery, [
      normalizedCity,
      normalizedDistrict,
      postal_code || null,
      neighborhood || null
    ])

    if (result.rows.length === 0) {
      // No exact match found, try city-only fallback
      const fallbackQuery = `
        SELECT
          z.id as zone_id,
          z.name as zone_name,
          z.branch_id,
          z.delivery_fee,
          z.estimated_delivery_time,
          z.min_order_amount,
          b.name as branch_name,
          b.address as branch_address,
          b.phone as branch_phone,
          b.email as branch_email,
          b.working_hours,
          60 as match_score, -- Lower score for fallback
          CASE
            WHEN z.branch_id IS NULL THEN false
            ELSE true
          END as has_branch,
          false as district_valid
        FROM zones z
        LEFT JOIN branches b ON z.branch_id = b.id
        WHERE z.is_active = true
        AND (b.is_active = true OR b.is_active IS NULL)
        AND LOWER(z.city) = $1
        ORDER BY z.delivery_fee ASC
        LIMIT 1
      `

      const fallbackResult = await pool.query(fallbackQuery, [normalizedCity])

      if (fallbackResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NO_SERVICE_AREA',
              message: 'We do not deliver to this address yet',
              details: {
                city: city,
                district: district,
                postal_code: postal_code
              }
            }
          },
          { status: 404 }
        )
      }

      const match = fallbackResult.rows[0]

      const response = {
        success: true,
        data: {
          zone: {
            id: match.zone_id,
            name: match.zone_name,
            delivery_fee: parseFloat(match.delivery_fee),
            estimated_delivery_time: match.estimated_delivery_time,
            min_order_amount: parseFloat(match.min_order_amount || 0)
          },
          branch: match.has_branch ? {
            id: match.branch_id,
            name: match.branch_name,
            address: match.branch_address,
            phone: match.branch_phone,
            email: match.branch_email,
            working_hours: match.working_hours
          } : null,
          address_validation: {
            city: city,
            district: district,
            postal_code: postal_code,
            neighborhood: neighborhood,
            is_valid: false, // Using fallback
            match_type: 'city_fallback'
          },
          service_info: {
            can_deliver: true,
            match_score: match.match_score,
            notes: `Limited delivery to ${city} area. Contact us for more information.`
          }
        }
      }

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })
    }

    const match = result.rows[0]

    // Get alternative zones (same city, different districts)
    const alternativesQuery = `
      SELECT
        z.id as zone_id,
        z.name as zone_name,
        z.district,
        z.delivery_fee,
        z.estimated_delivery_time,
        b.name as branch_name
      FROM zones z
      LEFT JOIN branches b ON z.branch_id = b.id
      WHERE z.is_active = true
      AND (b.is_active = true OR b.is_active IS NULL)
      AND LOWER(z.city) = $1
      AND LOWER(z.district) != $2
      ORDER BY z.delivery_fee ASC
      LIMIT 3
    `

    const alternativesResult = await pool.query(alternativesQuery, [normalizedCity, normalizedDistrict])

    const response = {
      success: true,
      data: {
        zone: {
          id: match.zone_id,
          name: match.zone_name,
          delivery_fee: parseFloat(match.delivery_fee),
          estimated_delivery_time: match.estimated_delivery_time,
          min_order_amount: parseFloat(match.min_order_amount || 0)
        },
        branch: match.has_branch ? {
          id: match.branch_id,
          name: match.branch_name,
          address: match.branch_address,
          phone: match.branch_phone,
          email: match.branch_email,
          working_hours: match.working_hours
        } : null,
        address_validation: {
          city: city,
          district: district,
          postal_code: postal_code,
          neighborhood: neighborhood,
          is_valid: match.district_valid,
          match_type: match.match_score === 100 ? 'exact' : match.match_score === 95 ? 'postal_code' : 'city_only'
        },
        service_info: {
          can_deliver: true,
          match_score: match.match_score,
          notes: match.match_score === 100
            ? `Perfect match! We deliver to ${district}, ${city}.`
            : match.match_score === 95
            ? `Delivery available via postal code match to ${city}.`
            : `Delivery available to ${city} area.`
        },
        alternatives: alternativesResult.rows.map(alt => ({
          zone: {
            id: alt.zone_id,
            name: alt.zone_name,
            district: alt.district,
            delivery_fee: parseFloat(alt.delivery_fee),
            estimated_delivery_time: alt.estimated_delivery_time
          },
          branch: alt.branch_name ? {
            name: alt.branch_name
          } : null
        }))
      }
    }

    // Record analytics
    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, true)

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zone lookup error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to lookup delivery zone'
        }
      },
      { status: 500 }
    )
  }
}

// GET /api/v1/zones/lookup - Get available cities and districts
export async function GET(request: NextRequest) {
  const startTime = performance.now()

  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (city) {
      // Get districts for a specific city
      const districtsQuery = `
        SELECT DISTINCT
          district,
          COUNT(*) as zone_count,
          MIN(delivery_fee) as min_delivery_fee,
          MAX(delivery_fee) as max_delivery_fee
        FROM zones
        WHERE is_active = true
        AND LOWER(city) = LOWER($1)
        GROUP BY district
        ORDER BY district
      `

      const result = await pool.query(districtsQuery, [city.trim()])

      const response = {
        success: true,
        data: {
          city: city,
          districts: result.rows.map(row => ({
            name: row.district,
            available_zones: parseInt(row.zone_count),
            delivery_fee_range: {
              min: parseFloat(row.min_delivery_fee),
              max: parseFloat(row.max_delivery_fee)
            }
          }))
        }
      }

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } else {
      // Get all available cities
      const citiesQuery = `
        SELECT
          city,
          COUNT(DISTINCT district) as district_count,
          COUNT(*) as zone_count,
          MIN(delivery_fee) as min_delivery_fee
        FROM zones
        WHERE is_active = true
        GROUP BY city
        ORDER BY city
      `

      const result = await pool.query(citiesQuery)

      const response = {
        success: true,
        data: {
          cities: result.rows.map(row => ({
            name: row.city,
            districts: parseInt(row.district_count),
            total_zones: parseInt(row.zone_count),
            min_delivery_fee: parseFloat(row.min_delivery_fee)
          })),
          total_cities: result.rows.length
        }
      }

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })
    }

  } catch (error) {
    console.error('Zone lookup GET error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/lookup', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch zone information'
        }
      },
      { status: 500 }
    )
  }
}