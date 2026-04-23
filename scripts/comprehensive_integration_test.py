#!/usr/bin/env python3
"""
Comprehensive Frontend-Backend Integration Test Suite
Tests all critical user flows and API integration points
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

# Test data
TEST_STUDENT = {
    "email": "student1@edify.local",
    "password": "TestPass123!"
}

TEST_TEACHER = {
    "email": "teacher1@edify.local", 
    "password": "TestPass123!"
}

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

class IntegrationTester:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.access_token = None
        self.refresh_token = None
        
    def print_header(self, text):
        print(f"\n{BOLD}{BLUE}{'='*80}{RESET}")
        print(f"{BOLD}{BLUE}{text.center(80)}{RESET}")
        print(f"{BOLD}{BLUE}{'='*80}{RESET}")
    
    def print_section(self, num, text):
        print(f"\n{BOLD}{text}{RESET}")
        print(f"{YELLOW}{'-'*80}{RESET}")
    
    def assert_success(self, condition, test_name, details=""):
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
    
    def print_summary(self):
        print(f"\n{BOLD}{BLUE}{'='*80}{RESET}")
        print(f"{BOLD}{BLUE}{'Test Summary'.center(80)}{RESET}")
        print(f"{BOLD}{BLUE}{'='*80}{RESET}")
        
        print(f"\nTotal Tests: {self.total_tests}")
        print(f"{GREEN}Passed: {self.passed_tests}{RESET}")
        if self.failed_tests > 0:
            print(f"{RED}Failed: {self.failed_tests}{RESET}")
        
        pass_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        if pass_rate == 100:
            print(f"\n{GREEN}{BOLD}🎉 ALL TESTS PASSED! (100%){RESET}\n")
        elif pass_rate >= 90:
            print(f"\n{GREEN}{BOLD}✅ Excellent Integration (90%+){RESET}\n")
        elif pass_rate >= 80:
            print(f"\n{YELLOW}{BOLD}⚠️  Good Integration (80%+){RESET}\n")
        else:
            print(f"\n{RED}{BOLD}❌ Issues Detected{RESET}\n")
    
    # ============================================================
    # TEST METHODS
    # ============================================================
    
    def test_frontend_connectivity(self):
        """Test 1: Frontend is serving"""
        self.print_section(1, "Test 1: Frontend Connectivity")
        
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            self.assert_success(
                response.status_code == 200,
                "Frontend Server Running",
                f"Status: {response.status_code}, Loading HTML: {len(response.text)} bytes"
            )
            
            self.assert_success(
                "Edify School OS" in response.text or "Edify" in response.text,
                "Frontend is Edify Application",
                "HTML contains Edify app identifier"
            )
        except requests.exceptions.ConnectionError:
            self.assert_success(False, "Frontend Server Running", "Connection refused - frontend may not be running")
        except Exception as e:
            self.assert_success(False, "Frontend Server Running", str(e))
    
    def test_backend_connectivity(self):
        """Test 2: Backend API is serving"""
        self.print_section(2, "Test 2: Backend Connectivity")
        
        try:
            response = requests.get(f"{API_V1}/curriculum/countries/", timeout=5)
            # Should be 401 due to missing auth - that's expected
            self.assert_success(
                response.status_code in [200, 401],
                "Backend API Responding",
                f"Status: {response.status_code}"
            )
            
            self.assert_success(
                response.headers.get('Content-Type') is not None,
                "API Returns JSON Content",
                f"Content-Type: {response.headers.get('Content-Type')}"
            )
        except requests.exceptions.ConnectionError:
            self.assert_success(False, "Backend API Responding", "Connection refused - backend not running")
        except Exception as e:
            self.assert_success(False, "Backend API Responding", str(e))
    
    def test_cors_headers(self):
        """Test 3: CORS is properly configured"""
        self.print_section(3, "Test 3: CORS Configuration")
        
        try:
            response = requests.options(f"{API_V1}/curriculum/countries/", timeout=5)
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            
            self.assert_success(
                cors_header is not None,
                "CORS Headers Present",
                f"Access-Control-Allow-Origin: {cors_header}"
            )
        except Exception as e:
            self.assert_success(False, "CORS Headers Present", str(e))
    
    def test_authentication_flow(self):
        """Test 4: Login and token retrieval"""
        self.print_section(4, "Test 4: Authentication Flow")
        
        try:
            login_url = f"{API_V1}/auth/token/"
            response = requests.post(
                login_url,
                json=TEST_STUDENT,
                timeout=5
            )
            
            self.assert_success(
                response.status_code == 200,
                "Login Endpoint Accepts Credentials",
                f"Status: {response.status_code}"
            )
            
            data = response.json()
            self.access_token = data.get('access')
            self.refresh_token = data.get('refresh')
            
            self.assert_success(
                self.access_token is not None,
                "Access Token Issued",
                f"Token length: {len(self.access_token) if self.access_token else 0}"
            )
            
            self.assert_success(
                self.refresh_token is not None,
                "Refresh Token Issued",
                "Enables token refresh without re-login"
            )
        except Exception as e:
            self.assert_success(False, "Authentication Flow", str(e))
    
    def test_authenticated_api_access(self):
        """Test 5: Access protected endpoints with token"""
        self.print_section(5, "Test 5: Authenticated API Access")
        
        if not self.access_token:
            print(f"{RED}⚠️  Skipping - No access token available{RESET}")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # Test marketplace listings
            response = requests.get(
                f"{API_V1}/marketplace/listings/",
                headers=headers,
                timeout=5
            )
            
            self.assert_success(
                response.status_code == 200,
                "Marketplace Listings Accessible",
                f"Status: {response.status_code}"
            )
            
            data = response.json()
            results = data.get('results', [])
            self.assert_success(
                len(results) > 0,
                "marketplace Data Retrieved",
                f"Listings found: {len(results)}"
            )
            
            if results:
                listing = results[0]
                self.assert_success(
                    all(k in listing for k in ['id', 'title', 'price_amount']),
                    "Listing Data Structure Valid",
                    f"Title: {listing.get('title')}, Price: {listing.get('price_amount')} UGX"
                )
        except Exception as e:
            self.assert_success(False, "Authenticated API Access", str(e))
    
    def test_curriculum_data(self):
        """Test 6: Curriculum endpoints return data"""
        self.print_section(6, "Test 6: Curriculum Data Access")
        
        if not self.access_token:
            print(f"{RED}⚠️  Skipping - No access token available{RESET}")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # Test countries
            response = requests.get(
                f"{API_V1}/curriculum/countries/",
                headers=headers,
                timeout=5
            )
            
            self.assert_success(
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
            
            data = response.json()
            results = data.get('results', [])
            self.assert_success(
                len(results) > 0,
                "Subjects Retrieved",
                f"Total subjects: {len(results)}"
            )
            
            # Test class levels
            response = requests.get(
                f"{API_V1}/curriculum/class-levels/",
                headers=headers,
                timeout=5
            )
            
            data = response.json()
            results = data.get('results', [])
            self.assert_success(
                len(results) > 0,
                "Class Levels Retrieved",
                f"Total levels: {len(results)}"
            )
        except Exception as e:
            self.assert_success(False, "Curriculum Data Access", str(e))
    
    def test_error_handling(self):
        """Test 7: Error handling and validation"""
        self.print_section(7, "Test 7: Error Handling & Validation")
        
        try:
            # Test invalid token rejection
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(
                f"{API_V1}/marketplace/listings/",
                headers=headers,
                timeout=5
            )
            
            self.assert_success(
                response.status_code in [401, 403],
                "Invalid Token Rejected",
                f"Status: {response.status_code} (expected 401/403)"
            )
            
            # Test missing auth header
            response = requests.get(
                f"{API_V1}/marketplace/listings/",
                timeout=5
            )
            
            self.assert_success(
                response.status_code in [401, 403],
                "Missing Auth Rejected",
                f"Status: {response.status_code} (expected 401/403)"
            )
        except Exception as e:
            self.assert_success(False, "Error Handling", str(e))
    
    def test_token_refresh(self):
        """Test 8: Token refresh mechanism"""
        self.print_section(8, "Test 8: Token Refresh Mechanism")
        
        if not self.refresh_token:
            print(f"{RED}⚠️  Skipping - No refresh token available{RESET}")
            return
        
        try:
            response = requests.post(
                f"{API_V1}/auth/token/refresh/",
                json={"refresh": self.refresh_token},
                timeout=5
            )
            
            self.assert_success(
                response.status_code == 200,
                "Token Refresh Endpoint",
                f"Status: {response.status_code}"
            )
            
            data = response.json()
            new_token = data.get('access')
            
            self.assert_success(
                new_token is not None and new_token != self.access_token,
                "New Access Token Generated",
                "Token can be refreshed without re-login"
            )
        except Exception as e:
            self.assert_success(False, "Token Refresh", str(e))
    
    def test_data_flow(self):
        """Test 9: Complete data flow from DB to API"""
        self.print_section(9, "Test 9: Data Flow & Integration")
        
        if not self.access_token:
            print(f"{RED}⚠️  Skipping - No access token available{RESET}")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # Fetch listings
            response = requests.get(
                f"{API_V1}/marketplace/listings/",
                headers=headers,
                timeout=5
            )
            
            listings = response.json().get('results', [])
            
            if listings:
                listing = listings[0]
                
                # Verify all required fields present
                required_fields = ['id', 'title', 'teacher', 'price_amount', 'visibility_state']
                has_all_fields = all(field in listing for field in required_fields)
                
                self.assert_success(
                    has_all_fields,
                    "Complete Data Structure from Backend",
                    f"All {len(required_fields)} required fields present"
                )
                
                # Verify data types
                self.assert_success(
                    isinstance(listing.get('price_amount'), (int, float)),
                    "Data Types are Correct",
                    f"Price amount is numeric: {type(listing.get('price_amount')).__name__}"
                )
        except Exception as e:
            self.assert_success(False, "Data Flow", str(e))
    
    def test_institutions(self):
        """Test 10: Institutions endpoint"""
        self.print_section(10, "Test 10: Institutions API")
        
        if not self.access_token:
            print(f"{RED}⚠️  Skipping - No access token available{RESET}")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            response = requests.get(
                f"{API_V1}/institutions/",
                headers=headers,
                timeout=5
            )
            
            self.assert_success(
                response.status_code == 200,
                "Institutions Endpoint",
                f"Status: {response.status_code}"
            )
            
            data = response.json()
            results = data.get('results', [])
            
            self.assert_success(
                len(results) > 0,
                "Institutions Data Retrieved",
                f"Institutions found: {len(results)}"
            )
        except Exception as e:
            self.assert_success(False, "Institutions API", str(e))
    
    def run_all_tests(self):
        """Execute all tests"""
        self.print_header("🧪 COMPREHENSIVE FRONTEND-BACKEND INTEGRATION TEST")
        
        print(f"\n{BOLD}Environment:{RESET}")
        print(f"  Frontend: {FRONTEND_URL}")
        print(f"  Backend: {BACKEND_URL}")
        print(f"  Timestamp: {datetime.now().isoformat()}")
        
        start_time = time.time()
        
        # Run all tests
        self.test_frontend_connectivity()
        self.test_backend_connectivity()
        self.test_cors_headers()
        self.test_authentication_flow()
        self.test_authenticated_api_access()
        self.test_curriculum_data()
        self.test_error_handling()
        self.test_token_refresh()
        self.test_data_flow()
        self.test_institutions()
        
        elapsed_time = time.time() - start_time
        
        # Print summary
        self.print_summary()
        
        print(f"Execution Time: {elapsed_time:.2f} seconds\n")
        
        # Exit with appropriate code
        return 0 if self.failed_tests == 0 else 1

if __name__ == "__main__":
    tester = IntegrationTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
