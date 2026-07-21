-- =============================================================================
-- Migration 014 — Catalogue public des réparations
-- =============================================================================
-- Expose uniquement les données nécessaires au site public.
-- Les tables restent protégées par leurs politiques RLS administrateur.
-- Les colonnes sensibles, notamment internal_note, ne sont jamais retournées.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_repair_brand(
  p_brand_slug text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id',                   b.id,
    'slug',                 b.slug,
    'name',                 b.name,
    'h1_prefix',            b.h1_prefix,
    'h1_brand',             b.h1_brand,
    'brand_icon',           b.brand_icon,
    'breadcrumb_label',     b.breadcrumb_label,
    'breadcrumb_href',      b.breadcrumb_href,
    'public_base_path',     b.public_base_path,
    'default_model_slug',   b.default_model_slug,
    'initial_family_count', b.initial_family_count,
    'repair_note',          b.repair_note,
    'search_placeholder',   b.search_placeholder,

    'families',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id',            f.id,
            'internal_key',  f.internal_key,
            'name',          f.name,
            'short_label',   f.short_label,
            'button_prefix', f.button_prefix,
            'sort_order',    f.sort_order,

            'models',
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id',           m.id,
                    'internal_key', m.internal_key,
                    'name',         m.name,
                    'slug',         m.slug,
                    'legacy_slug',  m.legacy_slug,
                    'sort_order',   m.sort_order,

                    'offers',
                    COALESCE(
                      (
                        SELECT jsonb_agg(
                          jsonb_build_object(
                            'id',               ro.id,
                            'variant_key',      ro.variant_key,
                            'variant_name',     ro.variant_name,
                            'subtitle',         ro.subtitle,
                            'pricing_mode',     ro.pricing_mode,
                            'price_cents',      ro.price_cents,
                            'currency',         ro.currency,
                            'availability',     ro.availability,
                            'duration_minutes', ro.duration_minutes,
                            'warranty_months',  ro.warranty_months,
                            'public_note',      ro.public_note,
                            'sort_order',       ro.sort_order,

                            'repair_type',
                            jsonb_build_object(
                              'id',           rt.id,
                              'internal_key', rt.internal_key,
                              'name',         rt.name,
                              'short_name',   rt.short_name,
                              'slug',         rt.slug,
                              'category',     rt.category,
                              'description',  rt.description,
                              'sort_order',   rt.sort_order
                            )
                          )
                          ORDER BY
                            rt.sort_order ASC,
                            ro.sort_order ASC,
                            ro.variant_key ASC
                        )
                        FROM public.repair_offers ro
                        JOIN public.repair_types rt
                          ON rt.id = ro.repair_type_id
                        WHERE ro.device_model_id = m.id
                          AND ro.status = 'active'
                          AND rt.status = 'active'
                          AND ro.availability <> 'unavailable'
                      ),
                      '[]'::jsonb
                    )
                  )
                  ORDER BY m.sort_order ASC, m.name ASC
                )
                FROM public.device_models m
                WHERE m.family_id = f.id
                  AND m.status = 'active'
              ),
              '[]'::jsonb
            )
          )
          ORDER BY f.sort_order ASC, f.name ASC
        )
        FROM public.device_families f
        WHERE f.brand_id = b.id
          AND f.status = 'active'
      ),
      '[]'::jsonb
    )
  )
  FROM public.brands b
  WHERE b.slug = p_brand_slug
    AND b.status = 'active'
  LIMIT 1;
$$;

REVOKE ALL
  ON FUNCTION public.get_public_repair_brand(text)
  FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION public.get_public_repair_brand(text)
  TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_public_repair_brand(text)
IS 'Retourne le catalogue public actif d’une marque sans données administratives sensibles.';
