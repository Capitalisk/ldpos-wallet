describe('Dark mode tests', () => {
  it('should toggle dark mode', () => {
    cy.visit('/');
    cy.get('.sidebar')
      .contains('CLSK')
      .click();

    cy.get('.modal-background')

    cy.get('.close-btn').click()
  });
});
