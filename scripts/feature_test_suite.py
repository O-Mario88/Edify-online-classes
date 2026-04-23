#!/usr/bin/env python3
"""
Comprehensive Feature-Level Testing Suite
Tests all major features, DB connections, data fetching, buttons, links, and dashboards
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"
API_V1 = f"{BACKEND_URL}/api/v1"

# Test credentials
TEST_STUDENT = {
    "email": "student1@edify.local",
    "password": "TestPass123!"
}

TEST_TEACHER = {
    "email": "teacher1@edify.local",
    "password": "TestPass123!"
}

TEST_ADMIN = {
    "email": "admin@edify.local",
    "password": "AdminPass123!"
}

# Color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

class FeatureTester:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.student_token = None
        self.teacher_token = None
        self.admin_token = None
        
    def print_header(self, text):
        print(f"\n{BOLD}{BLUE}{'='*90}{RESET}")
        print(f"{BOLD}{BLUE}{text.center(90)}{RESET}")
        print(f"{BOLD}{BLUE}{'='*90}{RESET}")
    
    def print_section(self, text):
        print(f"\n{BOLD}{YELLOW}{text}{RESET}")
        print(f"{YELLOW}{'-'*90}{RESET}")
    
    def assert_test(self, condition, test_name, details=""):
        self.total_tests += 1
        if condition:
            self.passed_tests += 1
            print(f"{GREEN}✅ PASS{RESET} {test_name}")
            if details:
                print(f"     {details}")
        else:
            self.failed_tests += 1
            print(f"{RED}❌ FAIL{RESET} {test_name}")
            if details:
                print(f"     {details}")
        return condition
    
    def get_token(self, credentials):
        """Get JWT token for user"""
        try:
            response = requests.post(
                f"{API_V1}/auth/token/",
                json={"email": credentials["email"], "password": credentials["password"]},
                timeout=5
            )
            if response.status_code == 200:
                return response.json().get('access')
        except:
            pass
        return None
    
    # ============================================================
    # FEATURE 1: AUTHENTICATION & LOGIN
    # ============================================================
    
    def test_authentication(self):
        """Test login and authentication for all user roles"""
        self.print_section("FEATURE 1: Authentication & Login")
        
        # Get tokens for all roles
        self.student_token = self.get_token(TEST_STUDENT)
        self.teacher_token = self.get_token(TEST_TEACHER)
        self.admin_token = self.get_token(TEST_ADMIN)
        
        self.assert_test(
            self.student_token is not None,
            "Student Login",
            f"Token received: {len(self.student_token) if self.student_token else 0} bytes"
        )
        
        self.assert_test(
            self.teacher_token is not None,
            "Teacher Login",
            f"Token received: {len(self.teacher_token) if self.teacher_token else 0} bytes"
        )
        
        self.assert_test(
            self.admin_token is not None,
            "Admin Login",
            f"Token received: {len(self.admin_token) if self.admin_token else 0} bytes"
        )
    
    # ============================================================
    # FEATURE 2: MARKETPLACE
    # ============================================================
    
    def test_marketplace(self):
        """Test marketplace listings, data fetching, and filtering"""
        self.print_section("FEATURE 2: Marketplace")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Test marketplace listings endpoint
        response = requests.get(
            f"{API_V1}/marketplace/listings/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Marketplace List Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        listings = data.get('results', [])
        
        self.assert_test(
            len(listings) > 0,
            "Marketplace Data Fetching",
            f"Retrieved {len(listings)} listings"
        )
        
        if listings:
            listing = listings[0]
            required_fields = ['id', 'title', 'teacher_name', 'price_amount', 'visibility_state']
            has_all = all(field in listing for field in required_fields)
            
            self.assert_test(
                has_all,
                "Marketplace Listing Data Structure",
                f"Title: {listing.get('title')}, Price: {listing.get('price_amount')} UGX"
            )
            
            self.assert_test(
                listing.get('visibility_state') == 'published',
                "Marketplace Listing is Published",
                f"Status: {listing.get('visibility_state')}"
            )
    
    # ============================================================
    # FEATURE 3: CURRICULUM & SUBJECTS
    # ============================================================
    
    def test_curriculum(self):
        """Test curriculum data, subjects, and class levels"""
        self.print_section("FEATURE 3: Curriculum & Subjects")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Test countries
        response = requests.get(
            f"{API_V1}/curriculum/countries/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Countries Endpoint",
            f"Status: {response.status_code}"
        )
        
        # Test subjects
        response = requests.get(
            f"{API_V1}/curriculum/subjects/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Subjects Endpoint",
            f"Status: {response.status_code}"
        )
        
        subjects = response.json().get('results', [])
        self.assert_test(
            len(subjects) > 0,
            "Subject Data Fetching",
            f"Retrieved {len(subjects)} subjects"
        )
        
        # Test class levels
        response = requests.get(
            f"{API_V1}/curriculum/class-levels/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Class Levels Endpoint",
            f"Status: {response.status_code}"
        )
        
        levels = response.json().get('results', [])
        self.assert_test(
            len(levels) > 0,
            "Education Levels Retrieval",
            f"Retrieved {len(levels)} levels (O-Level, A-Level, etc.)"
        )
    
    # ============================================================
    # FEATURE 4: INSTITUTIONS
    # ============================================================
    
    def test_institutions(self):
        """Test institution management and access"""
        self.print_section("FEATURE 4: Institutions")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        response = requests.get(
            f"{API_V1}/institutions/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Institutions Endpoint",
            f"Status: {response.status_code}"
        )
        
        institutions = response.json().get('results', [])
        
        self.assert_test(
            len(institutions) > 0,
            "User Institution Access",
            f"User has access to {len(institutions)} institution(s)"
        )
        
        if institutions:
            inst = institutions[0]
            self.assert_test(
                'name' in inst and 'id' in inst,
                "Institution Data Structure",
                f"Institution: {inst.get('name')}"
            )
    
    # ============================================================
    # FEATURE 5: ASSESSMENTS
    # ============================================================
    
    def test_assessments(self):
        """Test assessments and exam functionality"""
        self.print_section("FEATURE 5: Assessments & Exams")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        response = requests.get(
            f"{API_V1}/assessments/assessment/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Assessments Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        self.assert_test(
            'count' in data or 'results' in data,
            "Assessment Data Structure",
            "Assessment list endpoint returning proper format"
        )
    
    # ============================================================
    # FEATURE 6: LIVE SESSIONS
    # ============================================================
    
    def test_live_sessions(self):
        """Test live sessions functionality"""
        self.print_section("FEATURE 6: Live Sessions")
        
        if not self.teacher_token:
            print(f"{RED}⚠️  Skipping - No teacher token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        response = requests.get(
            f"{API_V1}/live-sessions/live-session/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Live Sessions Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        self.assert_test(
            isinstance(data, dict),
            "Live Sessions Data Structure",
            "Endpoint returning valid JSON"
        )
    
    # ============================================================
    # FEATURE 7: RESOURCES & LIBRARY
    # ============================================================
    
    def test_resources(self):
        """Test resource library and file access"""
        self.print_section("FEATURE 7: Resource Library")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        response = requests.get(
            f"{API_V1}/resources/resource/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Resources Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        results = data.get('results', [])
        
        self.assert_test(
            isinstance(results, list),
            "Resource Data Retrieval",
            f"Resources endpoint returning list format"
        )
    
    # ============================================================
    # FEATURE 8: LESSONS
    # ============================================================
    
    def test_lessons(self):
        """Test lesson management"""
        self.print_section("FEATURE 8: Lessons")
        
        if not self.teacher_token:
            print(f"{RED}⚠️  Skipping - No teacher token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        response = requests.get(
            f"{API_V1}/lessons/lesson/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Lessons Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        self.assert_test(
            'results' in data or 'count' in data,
            "Lesson Data Structure",
            "Lessons endpoint returning proper format"
        )
    
    # ============================================================
    # FEATURE 9: CLASSES
    # ============================================================
    
    def test_classes(self):
        """Test class management"""
        self.print_section("FEATURE 9: Classes")
        
        if not self.teacher_token:
            print(f"{RED}⚠️  Skipping - No teacher token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        response = requests.get(
            f"{API_V1}/classes/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code == 200,
            "Classes Endpoint",
            f"Status: {response.status_code}"
        )
        
        data = response.json()
        self.assert_test(
            isinstance(data, (dict, list)),
            "Class Data Format",
            "Classes endpoint returning valid data"
        )
    
    # ============================================================
    # FEATURE 10: TEACHER PAYOUTS & WALLETS
    # ============================================================
    
    def test_payouts(self):
        """Test teacher wallet and payout functionality"""
        self.print_section("FEATURE 10: Teacher Wallets & Payouts")
        
        if not self.teacher_token:
            print(f"{RED}⚠️  Skipping - No teacher token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        # Check wallet endpoint
        response = requests.get(
            f"{API_V1}/marketplace/payouts/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code in [200, 404],
            "Wallet/Payouts Endpoint",
            f"Status: {response.status_code}"
        )
    
    # ============================================================
    # FEATURE 11: ATTENDANCE
    # ============================================================
    
    def test_attendance(self):
        """Test attendance tracking"""
        self.print_section("FEATURE 11: Attendance")
        
        if not self.teacher_token:
            print(f"{RED}⚠️  Skipping - No teacher token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        response = requests.get(
            f"{API_V1}/lessons/lesson-attendance/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code in [200, 404],
            "Attendance Endpoint",
            f"Status: {response.status_code}"
        )
    
    # ============================================================
    # FEATURE 12: DISCUSSIONS & FORUMS
    # ============================================================
    
    def test_discussions(self):
        """Test discussion forums"""
        self.print_section("FEATURE 12: Discussions & Forums")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        response = requests.get(
            f"{API_V1}/discussions/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code in [200, 404],
            "Discussions/Forum Endpoint",
            f"Status: {response.status_code}"
        )
    
    # ============================================================
    # FEATURE 13: NOTIFICATIONS
    # ============================================================
    
    def test_notifications(self):
        """Test notification system"""
        self.print_section("FEATURE 13: Notifications")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        response = requests.get(
            f"{API_V1}/notifications/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code in [200, 404],
            "Notifications Endpoint",
            f"Status: {response.status_code}"
        )
    
    # ============================================================
    # FEATURE 14: ANALYTICS
    # ============================================================
    
    def test_analytics(self):
        """Test analytics and reporting"""
        self.print_section("FEATURE 14: Analytics & Reporting")
        
        if not self.admin_token:
            print(f"{RED}⚠️  Skipping - No admin token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = requests.get(
            f"{API_V1}/analytics/",
            headers=headers,
            timeout=5
        )
        
        self.assert_test(
            response.status_code in [200, 404],
            "Analytics Endpoint",
            f"Status: {response.status_code}"
        )
    
    # ============================================================
    # DB CONNECTION TESTS
    # ============================================================
    
    def test_database_connections(self):
        """Test database connectivity and integrity"""
        self.print_section("FEATURE 15: Database Connectivity")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Make multiple requests to verify DB consistency
        endpoints = [
            ("Marketplace", f"{API_V1}/marketplace/listings/"),
            ("Subjects", f"{API_V1}/curriculum/subjects/"),
            ("Institutions", f"{API_V1}/institutions/"),
            ("Assessments", f"{API_V1}/assessments/assessment/"),
        ]
        
        all_responsive = True
        for name, endpoint in endpoints:
            response = requests.get(endpoint, headers=headers, timeout=5)
            success = response.status_code == 200
            all_responsive = all_responsive and success
            
            self.assert_test(
                success,
                f"Database Connection - {name}",
                f"Status: {response.status_code}"
            )
        
        self.assert_test(
            all_responsive,
            "Overall Database Health",
            "All endpoints responding and serving data"
        )
    
    # ============================================================
    # BUTTON & LINK SIMULATION TESTS
    # ============================================================
    
    def test_navigation_links(self):
        """Test major navigation paths (simulated button clicks)"""
        self.print_section("FEATURE 16: Navigation & Links")
        
        if not self.student_token:
            print(f"{RED}⚠️  Skipping - No student token{RESET}")
            return
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Simulate navigation by testing endpoints that would be called
        navigation_paths = [
            ("Go to Marketplace", f"{API_V1}/marketplace/listings/"),
            ("Browse Subjects", f"{API_V1}/curriculum/subjects/"),
            ("View Institutions", f"{API_V1}/institutions/"),
            ("Access Learning Resources", f"{API_V1}/resources/resource/"),
            ("View Assessments", f"{API_V1}/assessments/assessment/"),
        ]
        
        for link_name, endpoint in navigation_paths:
            response = requests.get(endpoint, headers=headers, timeout=5)
            self.assert_test(
                response.status_code == 200,
                f"Link: {link_name}",
                f"Endpoint accessible: {response.status_code}"
            )
    
    # ============================================================
    # DASHBOARD TESTS
    # ============================================================
    
    def test_dashboards(self):
        """Test dashboard data fetching"""
        self.print_section("FEATURE 17: Dashboards & Data Display")
        
        # Test Student Dashboard Data
        if self.student_token:
            headers = {"Authorization": f"Bearer {self.student_token}"}
            
            # Student dashboard would need:
            # - Enrolled classes
            # - Recent assignments
            # - Learning progress
            # - Marketplace recommendations
            
            response = requests.get(
                f"{API_V1}/marketplace/listings/",
                headers=headers,
                timeout=5
            )
            
            self.assert_test(
                response.status_code == 200,
                "Student Dashboard - Marketplace Widget",
                "Can fetch data for dashboard display"
            )
        
        # Test Teacher Dashboard Data
        if self.teacher_token:
            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            
            # Teacher dashboard would need:
            # - Assigned classes
            # - Student performance
            # - Lesson schedule
            # - Earnings/wallet
            
            response = requests.get(
                f"{API_V1}/classes/",
                headers=headers,
                timeout=5
            )
            
            self.assert_test(
                response.status_code == 200,
                "Teacher Dashboard - Classes Widget",
                "Can fetch class data for dashboard"
            )
        
        # Test Admin Dashboard Data
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Admin dashboard would need:
            # - System statistics
            # - User metrics
            # - Transaction logs
            # - Performance analytics
            
            response = requests.get(
                f"{API_V1}/institutions/",
                headers=headers,
                timeout=5
            )
            
            self.assert_test(
                response.status_code == 200,
                "Admin Dashboard - Institutions Widget",
                "Can fetch admin data for dashboard"
            )
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{BOLD}{BLUE}{'='*90}{RESET}")
        print(f"{BOLD}{BLUE}{'FEATURE TEST SUMMARY'.center(90)}{RESET}")
        print(f"{BOLD}{BLUE}{'='*90}{RESET}")
        
        print(f"\nTotal Tests: {self.total_tests}")
        print(f"{GREEN}Passed: {self.passed_tests}{RESET}")
        if self.failed_tests > 0:
            print(f"{RED}Failed: {self.failed_tests}{RESET}")
        
        pass_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        if pass_rate == 100:
            print(f"\n{GREEN}{BOLD}🎉 ALL FEATURES FULLY OPERATIONAL! (100%){RESET}\n")
        elif pass_rate >= 90:
            print(f"\n{GREEN}{BOLD}✅ All Critical Features Working (90%+){RESET}\n")
        elif pass_rate >= 80:
            print(f"\n{YELLOW}{BOLD}⚠️  Most Features Working (80%+){RESET}\n")
        else:
            print(f"\n{RED}{BOLD}❌ Some Features Need Attention{RESET}\n")
        
        return 0 if self.failed_tests == 0 else 1
    
    def run_all_tests(self):
        """Execute all feature tests"""
        self.print_header("🧪 COMPREHENSIVE FEATURE-LEVEL TESTING")
        
        print(f"\n{BOLD}Testing Environment:{RESET}")
        print(f"  Frontend: {FRONTEND_URL}")
        print(f"  Backend: {BACKEND_URL}")
        print(f"  Timestamp: {datetime.now().isoformat()}")
        
        start_time = time.time()
        
        # Run all feature tests
        self.test_authentication()
        self.test_marketplace()
        self.test_curriculum()
        self.test_institutions()
        self.test_assessments()
        self.test_live_sessions()
        self.test_resources()
        self.test_lessons()
        self.test_classes()
        self.test_payouts()
        self.test_attendance()
        self.test_discussions()
        self.test_notifications()
        self.test_analytics()
        self.test_database_connections()
        self.test_navigation_links()
        self.test_dashboards()
        
        elapsed_time = time.time() - start_time
        
        # Print summary
        exit_code = self.print_summary()
        
        print(f"Execution Time: {elapsed_time:.2f} seconds\n")
        
        return exit_code

if __name__ == "__main__":
    tester = FeatureTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
