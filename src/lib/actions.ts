"use server";

export async function saveDataEntry(data: {
  title: string;
  description?: string;
  category: string;
  status: string;
  value: number;
  metadata?: string;
}) {
  return { success: true };
}

export async function deleteAllDataEntries() {
  return { success: true };
}

export async function getDataEntries() {
  return [];
}