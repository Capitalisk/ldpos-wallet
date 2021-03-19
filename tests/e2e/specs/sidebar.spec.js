describe('Sidebar', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.get('.sidebar').contains('DASHBOARD');
    cy.get('.sidebar').contains('WALLET');
    cy.get('.sidebar').contains('VOTING');
    cy.get('.sidebar').contains('TRANSACTIONS');
    cy.get('.sidebar').contains('BLOCKS');
    cy.get('.sidebar').contains('ACCOUNTS');
  });
});
