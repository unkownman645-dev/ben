"""
Automated unit and integration test suite for College Survival Score Calculator
"""
import unittest
import json
from app import app

class CollegeSurvivalCalculatorTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_homepage_loads(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        content = response.data.decode('utf-8')
        self.assertIn("COLLEGE SURVIVAL SCORE CALCULATOR", content)
        self.assertIn("MOCKING MODE", content)
        self.assertIn("CALCULATE MY SURVIVAL SCORE", content)

    def test_calculate_standard_student(self):
        payload = {
            "attendance": 75.0,
            "cgpa": 7.5,
            "assignments": 2,
            "money": 2500,
            "days_left": 25,
            "back_papers": 0,
            "sleep_hours": 6.0,
            "cooking": "Maggi/eggs",
            "tech_level": "Intermediate",
            "social_level": "Normal",
            "mocking": "Meme supplier"
        }
        res = self.client.post('/api/calculate', 
                               data=json.dumps(payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('total_score', data)
        self.assertGreaterEqual(data['total_score'], 0)
        self.assertLessEqual(data['total_score'], 100)
        self.assertEqual(len(data['breakdown']), 11)
        self.assertIn('strongest_skill', data)
        self.assertIn('biggest_threat', data)
        self.assertIn('tier', data)
        self.assertIn('custom_roast', data)
        self.assertIn('random_advice', data)

    def test_calculate_god_tier(self):
        # Maximum possible score
        payload = {
            "attendance": 99.0,
            "cgpa": 9.9,
            "assignments": 0,
            "money": 15000,
            "days_left": 5,
            "back_papers": 0,
            "sleep_hours": 8.0,
            "cooking": "Hostel chef",
            "tech_level": "Expert",
            "social_level": "Campus celebrity",
            "mocking": "Final boss of mocking"
        }
        res = self.client.post('/api/calculate', 
                               data=json.dumps(payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['total_score'], 100)
        self.assertIn("COLLEGE SURVIVAL GOD", data['tier']['badge'])

    def test_calculate_college_has_won_tier(self):
        # Minimum score
        payload = {
            "attendance": 10.0,
            "cgpa": 3.0,
            "assignments": 15,
            "money": 10,
            "days_left": 120,
            "back_papers": 8,
            "sleep_hours": 1.5,
            "cooking": "Cannot cook",
            "tech_level": "Beginner",
            "social_level": "NPC",
            "mocking": "Not funny"
        }
        res = self.client.post('/api/calculate', 
                               data=json.dumps(payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertLessEqual(data['total_score'], 19)
        self.assertIn("COLLEGE HAS WON", data['tier']['badge'])

    def test_validation_errors(self):
        # Test negative attendance
        res = self.client.post('/api/calculate',
                               data=json.dumps({"attendance": -5}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])

        # Test attendance > 100
        res = self.client.post('/api/calculate',
                               data=json.dumps({"attendance": 150}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 400)

        # Test negative money
        res = self.client.post('/api/calculate',
                               data=json.dumps({"attendance": 80, "cgpa": 8, "money": -50}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 400)

    def test_roast_topics(self):
        topics = ["attendance", "cgpa", "money", "assignments", "sleep", "back_papers", "everything"]
        for topic in topics:
            res = self.client.post('/api/roast-topic',
                                   data=json.dumps({"topic": topic, "attendance": 35, "cgpa": 5.2}),
                                   content_type='application/json')
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertTrue(data['success'])
            self.assertEqual(data['topic'], topic)
            self.assertTrue(len(data['roast']) > 10)

    def test_random_student(self):
        res = self.client.get('/api/random-student')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('profile', data)
        self.assertIn('name', data['profile'])
        self.assertIn('attendance', data['profile'])

    def test_random_advice(self):
        res = self.client.get('/api/random-advice')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(len(data['advice']) > 5)

if __name__ == '__main__':
    unittest.main()
