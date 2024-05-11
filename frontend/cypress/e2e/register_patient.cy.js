// cypress/integration/login_spec.js
describe('Patient Registration', function () {
  it('successfully registers account', function () {
    cy.visit('localhost:3000/register')  // Change URL to match your local dev environment

    cy.get('input[name=first_name]').type('first');
    cy.get('input[name=last_name]').type('last');
    cy.get('input[name=email]').type('testpatient2@email.com')
    cy.get('input[name=password]').type('testpatient2')
    cy.get('input[name=confirm-password]').type('testpatient2')
    
    cy.get('input[id=terms]').check()

    cy.get('form').submit()

    // Should be redirected to the dashboard
    cy.url().should('include', '/dashboard')
  })
})
