// Live automation demo data for the OrangeHRM demo site.
// Target: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
// Credentials: Admin / admin123
//
// Each test case has framework-agnostic `steps` used to drive the live demo
// playback (console log + simulated browser), plus per-framework source code.

export const BASE_URL =
  'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login'

export const frameworks = [
  { id: 'codeceptjs', label: 'CodeceptJS' },
  { id: 'selenium-python', label: 'Selenium (Python)' },
  { id: 'playwright', label: 'Playwright (JS)' },
  { id: 'cypress', label: 'Cypress' },
]

export const testCases = [
  {
    id: 'TC01',
    title: 'Valid login with Admin credentials',
    description:
      'Verify a user can log in with valid credentials and lands on the Dashboard.',
    expected: 'Dashboard is displayed after successful login.',
    steps: [
      { log: 'Navigate to login page', state: { screen: 'login' } },
      { log: "Fill username → 'Admin'", state: { screen: 'login', username: 'Admin', focus: 'username' } },
      { log: "Fill password → 'admin123'", state: { screen: 'login', username: 'Admin', password: '•••••••••', focus: 'password' } },
      { log: 'Click Login button', state: { screen: 'login', username: 'Admin', password: '•••••••••', focus: 'submit' } },
      { log: 'Assert Dashboard header is visible', state: { screen: 'dashboard' }, pass: true },
    ],
  },
  {
    id: 'TC02',
    title: 'Invalid login shows error',
    description: 'Verify an error is shown when an invalid password is used.',
    expected: '"Invalid credentials" message is displayed.',
    steps: [
      { log: 'Navigate to login page', state: { screen: 'login' } },
      { log: "Fill username → 'Admin'", state: { screen: 'login', username: 'Admin', focus: 'username' } },
      { log: "Fill password → 'wrongpass'", state: { screen: 'login', username: 'Admin', password: '••••••••', focus: 'password' } },
      { log: 'Click Login button', state: { screen: 'login', username: 'Admin', password: '••••••••', focus: 'submit' } },
      { log: 'Assert "Invalid credentials" alert', state: { screen: 'login', error: 'Invalid credentials' }, pass: true },
    ],
  },
  {
    id: 'TC03',
    title: 'Required field validation',
    description: 'Verify validation messages appear when fields are empty.',
    expected: '"Required" messages are shown under username and password.',
    steps: [
      { log: 'Navigate to login page', state: { screen: 'login' } },
      { log: 'Click Login without filling fields', state: { screen: 'login', focus: 'submit' } },
      { log: 'Assert "Required" under username', state: { screen: 'login', fieldError: true } },
      { log: 'Assert "Required" under password', state: { screen: 'login', fieldError: true }, pass: true },
    ],
  },
  {
    id: 'TC04',
    title: 'Search employee in PIM',
    description: 'Log in, open PIM module and search for an employee.',
    expected: 'Employee list table is displayed for the search term.',
    steps: [
      { log: 'Navigate to login page', state: { screen: 'login' } },
      { log: 'Login as Admin', state: { screen: 'dashboard' } },
      { log: 'Open PIM module', state: { screen: 'pim-list' } },
      { log: "Search employee name → 'a'", state: { screen: 'pim-list', search: 'a' } },
      { log: 'Assert results table is rendered', state: { screen: 'pim-list', search: 'a', results: true }, pass: true },
    ],
  },
  {
    id: 'TC05',
    title: 'Logout from dashboard',
    description: 'Verify the user can log out and is returned to the login page.',
    expected: 'Login page is displayed after logout.',
    steps: [
      { log: 'Login as Admin', state: { screen: 'dashboard' } },
      { log: 'Open user dropdown', state: { screen: 'dashboard', menu: true } },
      { log: 'Click Logout', state: { screen: 'dashboard', menu: true } },
      { log: 'Assert login page is shown', state: { screen: 'login' }, pass: true },
    ],
  },
]

// ---- Source code per framework, keyed by test case id ----
export function getCode(frameworkId, tc) {
  const builders = {
    'codeceptjs': codeceptjs,
    'selenium-python': seleniumPython,
    'playwright': playwright,
    'cypress': cypress,
  }
  return (builders[frameworkId] || codeceptjs)(tc)
}

function codeceptjs(tc) {
  const body = {
    TC01: `  I.amOnPage('/web/index.php/auth/login');
  I.fillField('username', 'Admin');
  I.fillField('password', 'admin123');
  I.click('Login');
  I.see('Dashboard');`,
    TC02: `  I.amOnPage('/web/index.php/auth/login');
  I.fillField('username', 'Admin');
  I.fillField('password', 'wrongpass');
  I.click('Login');
  I.see('Invalid credentials');`,
    TC03: `  I.amOnPage('/web/index.php/auth/login');
  I.click('Login');
  I.see('Required');`,
    TC04: `  I.amOnPage('/web/index.php/auth/login');
  I.fillField('username', 'Admin');
  I.fillField('password', 'admin123');
  I.click('Login');
  I.click('PIM');
  I.fillField('Employee Name', 'a');
  I.click('Search');
  I.seeElement('.oxd-table');`,
    TC05: `  I.amOnPage('/web/index.php/auth/login');
  I.fillField('username', 'Admin');
  I.fillField('password', 'admin123');
  I.click('Login');
  I.click('.oxd-userdropdown-tab');
  I.click('Logout');
  I.seeElement('input[name=username]');`,
  }
  return `// CodeceptJS — ${tc.id}
Feature('OrangeHRM Auth');

Scenario('${tc.title}', ({ I }) => {
${body[tc.id]}
});`
}

function seleniumPython(tc) {
  const body = {
    TC01: `    driver.find_element(By.NAME, "username").send_keys("Admin")
    driver.find_element(By.NAME, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    assert "dashboard" in driver.current_url`,
    TC02: `    driver.find_element(By.NAME, "username").send_keys("Admin")
    driver.find_element(By.NAME, "password").send_keys("wrongpass")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    alert = wait.until(EC.visibility_of_element_located(
        (By.CSS_SELECTOR, ".oxd-alert-content-text")))
    assert alert.text == "Invalid credentials"`,
    TC03: `    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    errors = driver.find_elements(By.CSS_SELECTOR, ".oxd-input-field-error-message")
    assert len(errors) == 2
    assert errors[0].text == "Required"`,
    TC04: `    driver.find_element(By.NAME, "username").send_keys("Admin")
    driver.find_element(By.NAME, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "PIM"))).click()
    box = wait.until(EC.visibility_of_element_located(
        (By.CSS_SELECTOR, "input[placeholder='Type for hints...']")))
    box.send_keys("a")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    assert driver.find_element(By.CSS_SELECTOR, ".oxd-table")`,
    TC05: `    driver.find_element(By.NAME, "username").send_keys("Admin")
    driver.find_element(By.NAME, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, ".oxd-userdropdown-tab"))).click()
    driver.find_element(By.LINK_TEXT, "Logout").click()
    assert driver.find_element(By.NAME, "username")`,
  }
  return `# Selenium + Python (pytest) — ${tc.id}
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_${tc.id.toLowerCase()}():
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)
    driver.get("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login")
${body[tc.id]}
    driver.quit()`
}

function playwright(tc) {
  const body = {
    TC01: `  await page.fill('input[name=username]', 'Admin');
  await page.fill('input[name=password]', 'admin123');
  await page.click('button[type=submit]');
  await expect(page.locator('h6')).toHaveText('Dashboard');`,
    TC02: `  await page.fill('input[name=username]', 'Admin');
  await page.fill('input[name=password]', 'wrongpass');
  await page.click('button[type=submit]');
  await expect(page.locator('.oxd-alert-content-text'))
    .toHaveText('Invalid credentials');`,
    TC03: `  await page.click('button[type=submit]');
  await expect(page.locator('.oxd-input-field-error-message').first())
    .toHaveText('Required');`,
    TC04: `  await page.fill('input[name=username]', 'Admin');
  await page.fill('input[name=password]', 'admin123');
  await page.click('button[type=submit]');
  await page.click('text=PIM');
  await page.fill("input[placeholder='Type for hints...']", 'a');
  await page.click('button[type=submit]');
  await expect(page.locator('.oxd-table')).toBeVisible();`,
    TC05: `  await page.fill('input[name=username]', 'Admin');
  await page.fill('input[name=password]', 'admin123');
  await page.click('button[type=submit]');
  await page.click('.oxd-userdropdown-tab');
  await page.click('text=Logout');
  await expect(page.locator('input[name=username]')).toBeVisible();`,
  }
  return `// Playwright (JS) — ${tc.id}
import { test, expect } from '@playwright/test';

test('${tc.title}', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
${body[tc.id]}
});`
}

function cypress(tc) {
  const body = {
    TC01: `    cy.get('input[name=username]').type('Admin');
    cy.get('input[name=password]').type('admin123');
    cy.get('button[type=submit]').click();
    cy.contains('h6', 'Dashboard').should('be.visible');`,
    TC02: `    cy.get('input[name=username]').type('Admin');
    cy.get('input[name=password]').type('wrongpass');
    cy.get('button[type=submit]').click();
    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');`,
    TC03: `    cy.get('button[type=submit]').click();
    cy.get('.oxd-input-field-error-message').first().should('have.text', 'Required');`,
    TC04: `    cy.get('input[name=username]').type('Admin');
    cy.get('input[name=password]').type('admin123');
    cy.get('button[type=submit]').click();
    cy.contains('PIM').click();
    cy.get("input[placeholder='Type for hints...']").type('a');
    cy.get('button[type=submit]').click();
    cy.get('.oxd-table').should('be.visible');`,
    TC05: `    cy.get('input[name=username]').type('Admin');
    cy.get('input[name=password]').type('admin123');
    cy.get('button[type=submit]').click();
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
    cy.get('input[name=username]').should('be.visible');`,
  }
  return `// Cypress — ${tc.id}
describe('OrangeHRM Auth', () => {
  it('${tc.title}', () => {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
${body[tc.id]}
  });
});`
}
