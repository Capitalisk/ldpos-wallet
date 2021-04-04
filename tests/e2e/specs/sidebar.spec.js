describe('Sidebar', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.get('.sidebar').contains('WALLET');
    cy.get('.sidebar').contains('DELEGATES');
    cy.get('.sidebar').contains('TRANSACTIONS');
    cy.get('.sidebar').contains('BLOCKS');
    cy.get('.sidebar').contains('ACCOUNTS');
  });
});
