// describe('Generates a wallet', () => {
//   it('It should click the generate button', () => {
//     cy.visit('/#/login');

//     cy.get('a.button.cursor-pointer')
//       .contains('Create one')
//       .click();

//     cy.waitUntil(() => {
//       return cy
//         .get('a.button')
//         .contains('Generating...')
//         .should('not.exist');
//     });

//     cy.get('a.button')
//       .contains('Sign in')
//       .click();

//     cy.waitUntil(() => cy.contains('Hang in there...').should('exist'))
//       .then(() => {
//         cy.wait(1500);
//         return cy
//           .get('h4')
//           .contains('Sign in to your wallet')
//           .should('not.exist');
//       })
//       .then(() => cy.get('a.button').contains('Send'));

//     cy.get('a.button')
//       .contains('Send')
//       .click();

//     cy.get('div.notification').contains(
//       "Cross your fingers and hope for a miraculous transaction. Until that, you don't have any balance to transfer.",
//     );

//     cy.get('a.button')
//       .contains('Register as a delegate')
//       .click();

//     // TODO Refactor ConfirmationModal and add tests for it.
//   });
// });
