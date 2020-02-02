user1 = User.create name: 'Alexey', email: 'alexey@mail.com', password: '12345678'
user2 = User.create name: 'Tester 1', email: 'test1@mail.com', password: '12345678'
user3 = User.create name: 'Tester 2', email: 'test2@mail.com', password: '12345678'

Message.create user_from: user1, user_to: user2, text: 'Hello!'
Message.create user_from: user2, user_to: user1, text: 'Hello'
