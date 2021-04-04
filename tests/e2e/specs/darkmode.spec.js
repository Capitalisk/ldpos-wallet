describe('Dark mode tests', () => {
  it('should toggle dark mode', () => {
    cy.visit('/');
    cy.get('#darkmode-switch')
      .click();
    cy.get('html').should('have.attr', 'dark-theme', 'false');

    cy.get('#darkmode-switch')
      .click();
    cy.get('html').should('have.attr', 'dark-theme', 'true');
  });
});
