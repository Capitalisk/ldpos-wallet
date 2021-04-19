describe('Generates a wallet', () => {
  it('It should click the generate button', () => {
    cy.visit('/');

    cy.get('a.button.cursor-pointer')
      .contains('Create one')
      .click();
  });
});
