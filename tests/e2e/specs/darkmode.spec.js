describe('Dark mode tests', () => {
  it('should toggle dark mode', () => {
    cy.visit('/');
    cy.get('a.button')
      .contains('Dark Mode')
      .click();
    cy.get('html').should('have.attr', 'dark-theme', 'true');
    cy.get('a.button')
      .contains('Dark Mode')
      .click();
    cy.get('html').should('have.attr', 'dark-theme', 'false');
  });
});
