from django.http import HttpResponse
from django.urls import include, path
from django.views.decorators.http import require_safe

from . import views


@require_safe
def health(request):
    from .models import AccessPolicy
    from .viewer import inventory, showcase

    AccessPolicy.objects.get(pk=1)
    inventory()
    showcase()
    return HttpResponse("ok", content_type="text/plain")


urlpatterns = [
    path("", views.atlas, name="atlas"),
    path("index.html", views.atlas),
    path("healthz", health),
    path("unlock/", views.unlock, name="atlas-unlock"),
    path("guest/redeem/", views.redeem, name="atlas-redeem"),
    path("sign-out/", views.sign_out, name="atlas-sign-out"),
    path("owner/", views.owner, name="atlas-owner"),
    path("activate/<uidb64>/<token>/", views.ActivateInvitation.as_view(), name="atlas-activate"),
    path("beta/image/<str:accession>/<int:index>/", views.beta_image, name="atlas-beta-image"),
    path("accounts/", include("allauth.urls")),
    path("<path:path>", views.file),
]
