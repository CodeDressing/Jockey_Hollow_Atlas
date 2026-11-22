from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email

from atlas_access.accounts import create_invitation


class Command(BaseCommand):
    help = "Email the first Atlas owner their account activation link."

    def add_arguments(self, parser):
        parser.add_argument("email")

    def handle(self, email, **options):
        validate_email(email)
        try:
            create_invitation(email, "owner")
        except (ValueError, RuntimeError) as error:
            raise CommandError(str(error)) from None
        self.stdout.write("Owner invitation accepted by the mail provider.")
