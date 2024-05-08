// cypress/integration/login_spec.js
describe('The Login Page', function () {
  it('successfully logs in', function () {
    cy.visit('localhost:3000/login')  // Change URL to match your local dev environment

    cy.get('input[name=email]').type('testuser@email.com')
    cy.get('input[name=password]').type('testpassword')
    cy.get('form').submit()

    // Should be redirected to the dashboard
    cy.url().should('include', '/dashboard')
  })
})
