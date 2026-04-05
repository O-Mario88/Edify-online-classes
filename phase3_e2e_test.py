#!/usr/bin/env python3
"""
Phase 3: Automated End-to-End Integration Test

This script simulates a complete user journey:
1. Load frontend HTML
2. Verify login endpoint works
3. Authenticate and get JWT tokens
4. Fetch protected resources
5. Verify data integration

Run: python3 phase3_e2e_test.py
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Tuple

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result"""
    status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if passed else f"{Colors.RED}❌ FAIL{Colors.RESET}"
    print(f"{status} {name}")
    if details:
        print(f"    {details}")

def print_section(name: str):
    """Print section header"""
    print(f"\n{Colors.BOLD}{name}{Colors.RESET}")
    print("-" * 80)

class E2ETest:
    def __init__(self):
        self.base_url = "http://localhost:8000/api/v1"
        self.frontend_url = "http://localhost:5174"
        self.test_email = "student1@edify.local"
        self.test_password = "TestPass123!"
        self.access_token = None
        self.refresh_token = None
        self.results = []
        self.start_time = None
        self.end_time = None

    def run_all_tests(self):
        """Run complete test suite"""
        print_header("🧪 PHASE 3: AUTOMATED E2E INTEGRATION TEST")
        self.start_time = time.time()
        
        # Test suites
        self.test_frontend_load()
        self.test_backend_connectivity()
        self.test_authentication()
        self.test_marketplace_integration()
        self.test_assessments_integration()
        self.test_error_handling()
        self.test_token_refresh()
        
        self.end_time = time.time()
        self.generate_report()

    def test_frontend_load(self):
        """Test 1: Frontend loads successfully"""
        print_section("Test 1: Frontend Application Load")
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            passed = response.status_code == 200
            self.results.append(("Frontend Load", passed))
            
            if passed:
                print_test("Frontend HTTP Response", True, f"Status: {response.status_code}")
                print_test("Frontend HTML Content", "<!DOCTYPE" in response.text or "<html" in response.text)
                self.results.append(("Frontend HTML Valid", "<!DOCTYPE" in response.text or "<html" in response.text))
            else:
                print_test("Frontend HTTP Response", False, f"Status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print_test("Frontend Connection", False, "Cannot connect to http://localhost:5174")
            self.results.append(("Frontend Load", False))
        except Exception as e:
            print_test("Frontend Load", False, str(e))
            self.results.append(("Frontend Load", False))

    def test_backend_connectivity(self):
        """Test 2: Backend connectivity"""
        print_section("Test 2: Backend Connectivity")
        
        try:
            # Test public endpoint
            response = requests.get(f"{self.base_url}/curriculum/countries/", timeout=5)
            public_pass = response.status_code < 500
            self.results.append(("Backend Public Endpoint", public_pass))
            print_test("Backend Public Endpoint", public_pass, f"Status: {response.status_code}")
            
            # Test CORS headers
            cors_headers = {
                'Origin': 'http://localhost:5174',
                'Access-Control-Request-Method': 'POST'
            }
            response = requests.options(
                f"{self.base_url}/auth/token/",
                headers=cors_headers,
                timeout=5
            )
            cors_pass = response.status_code in [200, 204]
            self.results.append(("CORS Headers", cors_pass))
            print_test("CORS Configuration", cors_pass or response.status_code == 401, f"Status: {response.status_code}")
            
        except Exception as e:
            print_test("Backend Connectivity", False, str(e))
            self.results.append(("Backend Connectivity", False))

    def test_authentication(self):
        """Test 3: JWT Authentication Flow"""
        print_section("Test 3: JWT Authentication Flow")
        
        auth_payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/token/",
                json=auth_payload,
                timeout=5
            )
            
            auth_pass = response.status_code == 200
            self.results.append(("Authentication", auth_pass))
            print_test("Login Request", auth_pass, f"Status: {response.status_code}")
            
            if auth_pass:
                data = response.json()
                self.access_token = data.get('access')
                self.refresh_token = data.get('refresh')
                
                token_pass = bool(self.access_token and self.refresh_token)
                self.results.append(("JWT Tokens Received", token_pass))
                print_test("Access Token", token_pass, f"Token: {self.access_token[:40]}..." if self.access_token else "Missing")
                print_test("Refresh Token", token_pass, f"Token: {self.refresh_token[:40]}..." if self.refresh_token else "Missing")
                
                # Verify token format (JWT = 3 parts separated by dots)
                jwt_valid = isinstance(self.access_token, str) and self.access_token.count('.') == 2
                self.results.append(("JWT Format Valid", jwt_valid))
                print_test("JWT Format", jwt_valid, "Bearer token format correct" if jwt_valid else "Invalid format")
                
        except Exception as e:
            print_test("Authentication", False, str(e))
            self.results.append(("Authentication", False))

    def test_marketplace_integration(self):
        """Test 4: Marketplace Listings Integration"""
        print_section("Test 4: Marketplace Listings Integration")
        
        if not self.access_token:
            print_test("Marketplace Listings", False, "No access token available")
            self.results.append(("Marketplace Listings", False))
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/marketplace/listings/",
                headers=headers,
                timeout=5
            )
            
            listings_pass = response.status_code == 200
            self.results.append(("Marketplace API", listings_pass))
            print_test("Marketplace API Endpoint", listings_pass, f"Status: {response.status_code}")
            
            if listings_pass:
                data = response.json()
                listing_count = len(data) if isinstance(data, list) else len(data.get('results', []))
                
                count_pass = listing_count > 0
                self.results.append(("Listings Returned", count_pass))
                print_test("Listings Data", count_pass, f"Found: {listing_count} marketplace listings")
                
                if listing_count > 0:
                    first_listing = data[0] if isinstance(data, list) else data['results'][0]
                    has_title = 'title' in first_listing
                    self.results.append(("Listing Data Structure", has_title))
                    print_test("Listing Data Structure", has_title, f"Title: {first_listing.get('title', 'N/A')}")
                    
        except Exception as e:
            print_test("Marketplace Integration", False, str(e))
            self.results.append(("Marketplace Integration", False))

    def test_assessments_integration(self):
        """Test 5: Assessments Integration"""
        print_section("Test 5: Assessments Endpoint Integration")
        
        if not self.access_token:
            print_test("Assessments Endpoint", False, "No access token available")
            self.results.append(("Assessments Endpoint", False))
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/assessments/assessment/",
                headers=headers,
                timeout=5
            )
            
            assessments_pass = response.status_code == 200
            self.results.append(("Assessments API", assessments_pass))
            print_test("Assessments API Endpoint", assessments_pass, f"Status: {response.status_code}")
            
            if assessments_pass:
                data = response.json()
                # Handle paginated response
                if isinstance(data, dict) and 'results' in data:
                    count = len(data['results'])
                    print_test("Assessments Count", True, f"Found: {count} assessments (paginated)")
                elif isinstance(data, list):
                    print_test("Assessments Count", True, f"Found: {len(data)} assessments (list)")
                else:
                    print_test("Assessments Response", True, "Endpoint accessible")
                    
                self.results.append(("Assessments Data", True))
                
        except Exception as e:
            print_test("Assessments Integration", False, str(e))
            self.results.append(("Assessments Integration", False))

    def test_error_handling(self):
        """Test 6: Error Handling and Fallbacks"""
        print_section("Test 6: Error Handling & Fallback Mechanisms")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_xyz"}
        
        try:
            response = requests.get(
                f"{self.base_url}/marketplace/listings/",
                headers=invalid_headers,
                timeout=5
            )
            
            # Should get 401 Unauthorized
            error_handling = response.status_code in [401, 403]
            self.results.append(("Invalid Token Rejection", error_handling))
            print_test("Invalid Token Handling", error_handling, f"Status: {response.status_code} (expected 401/403)")
            
        except Exception as e:
            print_test("Error Handling Test", False, str(e))
            self.results.append(("Error Handling", False))
        
        # Test missing auth header
        try:
            response = requests.get(
                f"{self.base_url}/marketplace/listings/",
                timeout=5
            )
            
            # Should get 401 Unauthorized
            no_token = response.status_code in [401, 403]
            self.results.append(("Missing Token Rejection", no_token))
            print_test("Missing Token Handling", no_token, f"Status: {response.status_code} (expected 401/403)")
            
        except Exception as e:
            print_test("Missing Token Test", False, str(e))

    def test_token_refresh(self):
        """Test 7: Token Refresh Mechanism"""
        print_section("Test 7: JWT Token Refresh")
        
        if not self.refresh_token:
            print_test("Token Refresh", False, "No refresh token available")
            self.results.append(("Token Refresh", False))
            return
        
        refresh_payload = {"refresh": self.refresh_token}
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/token/refresh/",
                json=refresh_payload,
                timeout=5
            )
            
            refresh_pass = response.status_code == 200
            self.results.append(("Token Refresh", refresh_pass))
            print_test("Token Refresh Endpoint", refresh_pass, f"Status: {response.status_code}")
            
            if refresh_pass:
                data = response.json()
                new_token = data.get('access')
                token_updated = new_token and new_token != self.access_token
                self.results.append(("New Token Generated", token_updated))
                print_test("New Access Token", token_updated, f"New token: {new_token[:40]}..." if new_token else "No token")
                
        except Exception as e:
            print_test("Token Refresh", False, str(e))
            self.results.append(("Token Refresh", False))

    def generate_report(self):
        """Generate comprehensive test report"""
        print_section("Test Results Summary")
        
        passed = sum(1 for _, result in self.results if result)
        total = len(self.results)
        
        # Print summary table
        print(f"\n{Colors.BOLD}Test Results:{Colors.RESET}")
        print("-" * 80)
        for test_name, passed_flag in self.results:
            status = f"{Colors.GREEN}✅{Colors.RESET}" if passed_flag else f"{Colors.RED}❌{Colors.RESET}"
            print(f"{status} {test_name}")
        
        # Overall status
        print_header(f"Overall Score: {passed}/{total} Tests Passed ({(passed/total*100):.0f}%)")
        
        if passed == total:
            print(f"{Colors.GREEN}{Colors.BOLD}✅ ALL TESTS PASSED - INTEGRATION COMPLETE!{Colors.RESET}\n")
        elif passed >= total * 0.8:
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  PARTIAL SUCCESS - {total-passed} test(s) need attention{Colors.RESET}\n")
        else:
            print(f"{Colors.RED}{Colors.BOLD}❌ INTEGRATION ISSUES DETECTED - Review logs above{Colors.RESET}\n")
        
        # Execution time
        duration = self.end_time - self.start_time
        print(f"Execution Time: {duration:.2f} seconds")
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Recommendations
        print_section("Recommendations")
        
        if not any(result for test_name, result in self.results if "Frontend Load" in test_name and result):
            print(f"• {Colors.RED}Frontend not responding{Colors.RESET} - Check if npm run dev is running on port 5174")
        
        if not any(result for test_name, result in self.results if "Authentication" in test_name and result):
            print(f"• {Colors.RED}Login failed{Colors.RESET} - Verify credentials and backend is running")
        
        if not any(result for test_name, result in self.results if "Marketplace" in test_name and result):
            print(f"• {Colors.YELLOW}Marketplace data not loading{Colors.RESET} - Check API seeding")
        
        if passed == total:
            print(f"• {Colors.GREEN}All checks passed!{Colors.RESET}")
            print(f"• Open browser to http://localhost:5174 and test login manually")
            print(f"• Frontend should display real marketplace listings from API")
        
        print("\n" + "="*80 + "\n")

def main():
    """Run the test suite"""
    tester = E2ETest()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
