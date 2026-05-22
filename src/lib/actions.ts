"use server";

import prisma from "./prisma";

export async function saveDataEntry(data: {
  title: string;
  description?: string;
  category: string;
  status: string;
  value: number;
  metadata?: string;
}) {
  await prisma.dataEntry.create({ data });
  return { success: true };
}

export async function saveDistributionEntries(
  entries: {
    serialNumber: number;
    subCity: string;
    woreda: string;
    numberOfCustomers: number;
    communitiesReceived: number;
    institutionCustomers?: number;
    nursingMothersQuintals?: number;
    communityQuintals?: number;
    institutionQuintals?: number;
    totalQuintals: number;
    fileName?: string;
  }[]
) {
  await prisma.distributionEntry.createMany({
    data: entries.map((e) => ({
      serialNumber: e.serialNumber,
      subCity: e.subCity,
      woreda: e.woreda,
      numberOfCustomers: e.numberOfCustomers,
      communitiesReceived: e.communitiesReceived,
      institutionCustomers: e.institutionCustomers ?? 0,
      nursingMothersQuintals: e.nursingMothersQuintals ?? 0,
      communityQuintals: e.communityQuintals ?? 0,
      institutionQuintals: e.institutionQuintals ?? 0,
      totalQuintals: e.totalQuintals,
      fileName: e.fileName ?? null,
    })),
  });
  return { success: true };
}

export async function deleteAllDataEntries() {
  await prisma.dataEntry.deleteMany();
  return { success: true };
}

export async function getDataEntries() {
  return await prisma.dataEntry.findMany();
}

export async function getDistributionEntries() {
  return await prisma.distributionEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteDistributionEntry(id: string) {
  await prisma.distributionEntry.delete({ where: { id } });
  return { success: true };
}

export async function deleteMultipleDistributionEntries(ids: string[]) {
  await prisma.distributionEntry.deleteMany({
    where: { id: { in: ids } },
  });
  return { success: true };
}
