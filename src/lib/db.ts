import prisma from "./prisma";

export const db = {
  dataEntry: prisma.dataEntry,
  distributionEntry: prisma.distributionEntry,
  user: prisma.user,
  company: prisma.company,
  contact: prisma.contact,
  tag: prisma.tag,
  interaction: prisma.interaction,
  note: prisma.note,
  customField: prisma.customField,
  customFieldValue: prisma.customFieldValue,
};

export default db;
