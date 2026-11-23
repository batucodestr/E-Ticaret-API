from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from addresses.models import Address, City
from .models import Order


class OrderViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='user@example.com',
            password='testpass123',
            phone='5551234567',
        )
        self.other_user = get_user_model().objects.create_user(
            email='other@example.com',
            password='testpass123',
            phone='5557654321',
        )
        self.city = City.objects.create(name='Istanbul')

    def create_address(self, user):
        return Address.objects.create(
            user=user,
            fullname='Test User',
            phone=user.phone,
            address_line='Test Street 1',
            city=self.city,
            street='Test Street',
            postal_code='34000',
        )

    def test_order_list_requires_authentication(self):
        response = self.client.get(reverse('order_list'))

        self.assertEqual(response.status_code, 401)

    def test_order_list_returns_only_current_users_orders(self):
        address = self.create_address(self.user)
        other_address = self.create_address(self.other_user)
        Order.objects.create(
            user=self.user,
            delivery_address=address,
            billing_address=address,
            total_price=100,
        )
        Order.objects.create(
            user=self.other_user,
            delivery_address=other_address,
            billing_address=other_address,
            total_price=200,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse('order_list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_price'], '100.00')
