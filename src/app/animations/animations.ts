import {
  query,
  trigger,
  stagger,
  transition,
  style,
  animate,
  keyframes,
  state
} from '@angular/animations';

export const galleryItemAnimation1 = trigger('galleryItemAnimation', [
  transition('* <=> *', [
    query(':enter', style({ opacity: 0 }), { optional: true }),

    query(
      ':enter',
      stagger('300ms', [
        animate(
          '0.7s ease-in',
          keyframes([
            style({ opacity: 0, transform: 'translateY(-75px)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(35px)', offset: 0.3 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
          ])
        )
      ]),
      { optional: true }
    ),
    query(
      ':leave',
      stagger('300ms', [
        animate(
          '0.7s ease-in',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(35px)', offset: 0.3 }),
            style({ opacity: 0, transform: 'translateY(-75px)', offset: 1 })
          ])
        )
      ]),
      { optional: true }
    )
  ])
]);

export const galleryItemAnimation = trigger('galleryItemAnimation', [
  transition('* <=> *', [
    query(':enter', style({ opacity: 0 }), { optional: true }),

    query(
      ':enter',
      stagger('300ms', [
        animate(
          '0.7s ease-in',
          keyframes([
            style({ opacity: 0, transform: 'translateY(-75px)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(35px)', offset: 0.3 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
          ])
        )
      ]),
      { optional: true }
    ),
    query(
      ':leave',
      stagger('300ms', [
        animate(
          '0.7s ease-in',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0.5, transform: 'translateY(35px)', offset: 0.3 }),
            style({ opacity: 0, transform: 'translateY(-75px)', offset: 1 })
          ])
        )
      ]),
      { optional: true }
    )
  ])
]);

export const cardAnimation = trigger('cardState', [
  state(
    'true',
    style({
      backgroundColor: '#eee',
      transform: 'scale(1)'
    })
  ),
  state(
    'false',
    style({
      backgroundColor: '#cfd8dc',
      transform: 'scale(1.1)'
    })
  ),
  transition('true <=> false', animate('100ms ease-in'))
]);
