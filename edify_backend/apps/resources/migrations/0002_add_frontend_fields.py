# Generated manually for frontend UI fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='description',
            field=models.TextField(blank=True, help_text='Detailed description of the resource content', null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='author',
            field=models.CharField(blank=True, help_text='Resource author name (optional, defaults to uploader name)', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='category',
            field=models.CharField(blank=True, help_text='Resource type: Textbook, Notes, Guide, Workbook, etc.', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, help_text='Price for marketplace sales (0 = free)', max_digits=8),
        ),
        migrations.AddField(
            model_name='resource',
            name='rating',
            field=models.DecimalField(decimal_places=2, default=4.0, help_text='Average rating from 0-5', max_digits=3),
        ),
        migrations.AddField(
            model_name='resource',
            name='is_featured',
            field=models.BooleanField(default=False, help_text='Flag for homepage/carousel feature'),
        ),
    ]
