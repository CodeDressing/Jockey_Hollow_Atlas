from django.db import migrations


def seed_policy(apps, schema_editor):
    apps.get_model("atlas_access", "AccessPolicy").objects.get_or_create(pk=1)


class Migration(migrations.Migration):
    dependencies = [("atlas_access", "0001_initial")]
    operations = [migrations.RunPython(seed_policy, migrations.RunPython.noop)]
