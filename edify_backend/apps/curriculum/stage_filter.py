"""Stage-based queryset filtering for the Primary/Secondary split.

A user's `stage` ('primary' or 'secondary') must fully isolate the content
they see. Every content viewset that exposes a queryset whose rows are
class-level specific should apply `filter_queryset_by_stage` so that a
primary user literally cannot retrieve a secondary row (and vice versa).

Most content models carry a FK chain `class_level__education_level`, where
`EducationLevel.is_primary` is the boolean splitting the two stages. A few
models (e.g. CareerPathway) don't chain to ClassLevel — they carry their
own `stage` char field and are filtered directly.
"""

from __future__ import annotations

from django.db.models import Q, QuerySet


def filter_queryset_by_stage(
    queryset: QuerySet,
    user,
    *,
    class_level_path: str = 'class_level',
    direct_stage_field: str | None = None,
    allow_null_class_level: bool = True,
) -> QuerySet:
    """Return `queryset` narrowed to rows matching the user's stage.

    - `class_level_path`: the lookup path from the model to its ClassLevel FK.
      Defaults to 'class_level'. Pass e.g. 'topic__class_level' for models
      that link to ClassLevel indirectly.
    - `direct_stage_field`: for models with their own `stage` char field
      (choices ['primary','secondary','both']). When set, we filter on that
      instead of the ClassLevel chain.
    - `allow_null_class_level`: when True (the default), rows whose
      class_level is NULL are kept visible — they represent cross-stage
      content (teacher-uploaded notes that apply to all, or items a
      seed author hasn't yet tagged). Production seed data always sets
      class_level, so strict per-stage isolation still holds end-to-end.

    Anonymous users / users without a stage get the queryset unchanged so
    marketing-visible pages (e.g. pricing, discovery) keep working.
    """
    if not user or not getattr(user, 'is_authenticated', False):
        return queryset
    stage = getattr(user, 'stage', None)
    if stage not in ('primary', 'secondary'):
        return queryset

    if direct_stage_field:
        # 'both' rows are visible to both stages; exact-match otherwise.
        return queryset.filter(
            Q(**{direct_stage_field: stage}) | Q(**{direct_stage_field: 'both'})
        )

    is_primary = (stage == 'primary')
    # ClassLevel → level → is_primary (the FK is named `level` on
    # ClassLevel, pointing at EducationLevel; see curriculum/models.py).
    lookup = f'{class_level_path}__level__is_primary'
    match = Q(**{lookup: is_primary})
    if allow_null_class_level:
        match |= Q(**{f'{class_level_path}__isnull': True})
    return queryset.filter(match)


class StageFilteredQuerysetMixin:
    """DRF viewset mixin: narrows get_queryset() by the request user's stage.

    Set `stage_class_level_path` on the viewset (default: 'class_level') to
    point at the ClassLevel FK. For models with a direct `stage` field, set
    `stage_direct_field` instead.
    """

    stage_class_level_path: str = 'class_level'
    stage_direct_field: str | None = None

    def get_queryset(self):  # type: ignore[override]
        qs = super().get_queryset()
        return filter_queryset_by_stage(
            qs,
            self.request.user,
            class_level_path=self.stage_class_level_path,
            direct_stage_field=self.stage_direct_field,
        )
