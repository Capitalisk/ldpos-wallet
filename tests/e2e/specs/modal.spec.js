describe('Modal tests', () => {
  it('should open the modal', () => {
    cy.visit('/');
    cy.get('a.first')
      .contains('CLSK')
      .click();

    cy.get('.modal-background');
    cy.get('.section');

    cy.get('.close-btn').click();
  });

  it('should open a stacked modal', () => {
    cy.visit('/');
    cy.get('a.first')
      .contains('CLSK')
      .click();

    cy.get('a.button')
      .contains('Add blockchain')
      .click();

    cy.get('.back-btn')
  });
});
