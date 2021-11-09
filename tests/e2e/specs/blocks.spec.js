describe('Blocks page tests', () => {
  it('should be loading the blocks', () => {
    cy.visit('/#/blocks');
    cy.get('progress');
  });

  // it('should open the filter popup', () => {
  //   cy.get('.button')
  //     .contains('Filter')
  //     .click();
  //   cy.get('.popup');
  //   cy.get('.button')
  //     .contains('Filter')
  //     .click();
  // });

  it('should hover a td', () => {
    cy.get('td')
      .first()
      .trigger('mouseover');
  });

  it('should sort', () => {
    cy.get('#sorting').click();
  });

  it('should load when scrolling to bottom and going to the next page and returns again', () => {
    cy.wait(500);
    cy.scrollTo('bottom');
    cy.get('#current-page').contains('1');

    cy.get('#next-page').click();
    cy.get('progress');
    cy.get('#current-page').contains('2');

    cy.get('#previous-page').click();
    cy.get('progress');
    cy.get('#current-page').contains('1');
  });

  it('shows details modal', () => {
    cy.get('td')
      .contains('clsk')
      .first()
      .click();

    cy.get('div.modal-background');

    cy.get('div.close-btn.cursor-pointer').click();
  });
});
