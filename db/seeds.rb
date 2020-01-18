user1 = User.create name: 'Alexey', email: 'alexey@mail.com', password: '12345678'
user2 = User.create name: 'Tester', email: 'test@mail.com', password: '12345678'

Message.create user_from: user1, user_to: user2, text: 'Hello!'
Message.create user_from: user2, user_to: user1, text: 'Hello'
