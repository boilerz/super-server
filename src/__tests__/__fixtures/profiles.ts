import { GoogleProfile } from '../../strategy';

export const johnDoe: GoogleProfile = Object.freeze({
  id: '42',
  gender: '',
  displayName: 'John Doe',
  name: {
    familyName: 'John',
    givenName: 'John',
  },
  emails: [
    {
      value: 'john@doe.co',
      verified: true,
    },
  ],
  photos: [],
  provider: 'google',
  _raw:
    '{\n  "sub": "42",\n  "name": "John",\n  "given_name": "John",\n  "family_name": "Doe",\n  "picture": "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",\n  "email": "john@doe.co",\n  "email_verified": true,\n  "locale": "fr"\n}',
  _json: {
    sub: '42',
    name: 'John',
    given_name: 'John',
    family_name: 'Doe',
    picture:
      'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg',
    email: 'john@doe.co',
    email_verified: true,
    locale: 'fr',
  },
});
