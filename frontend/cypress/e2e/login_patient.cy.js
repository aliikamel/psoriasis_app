// cypress/integration/login_spec.js
describe('Login Patient', function () {
  it('successfully logs in', function () {
    cy.visit('localhost:3000/login')

    cy.get('input[name=email]').type('patient1@email.com')
    cy.get('input[name=password]').type('patient')
    cy.get('form').submit()

    // Should be redirected to the dashboard
    cy.url().should('include', '/dashboard')
  })
})
