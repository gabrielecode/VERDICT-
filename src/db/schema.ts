import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const decisions = pgTable('decisions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(), // 'single' | 'multiple' | 'yes_no' | 'rating'
  deadline: timestamp('deadline').notNull(),
  audience: text('audience').notNull(),
  creatorUid: text('creator_uid').references(() => users.uid).notNull(),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const options = pgTable('options', {
  id: serial('id').primaryKey(),
  decisionId: integer('decision_id').references(() => decisions.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
});

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  decisionId: integer('decision_id').references(() => decisions.id, { onDelete: 'cascade' }).notNull(),
  optionIds: jsonb('option_ids').default([]),
  ratingValue: integer('rating_value'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  decisionId: integer('decision_id').references(() => decisions.id, { onDelete: 'cascade' }).notNull(),
  author: text('author').notNull(),
  avatar: text('avatar'),
  role: text('role'),
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  department: text('department').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: text('role').notNull(),
  avatar: text('avatar'),
  status: text('status').notNull(),
});

// Relations
export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  creator: one(users, {
    fields: [decisions.creatorUid],
    references: [users.uid],
  }),
  options: many(options),
  votes: many(votes),
  comments: many(comments),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  decision: one(decisions, {
    fields: [options.decisionId],
    references: [decisions.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.uid],
  }),
  decision: one(decisions, {
    fields: [votes.decisionId],
    references: [decisions.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.uid],
  }),
  decision: one(decisions, {
    fields: [comments.decisionId],
    references: [decisions.id],
  }),
}));
