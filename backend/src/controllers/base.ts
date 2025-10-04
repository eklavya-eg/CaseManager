import { PrismaClient } from "@prisma/client";

export class BaseController {
    constructor(private prismaModel: any) {
    }
    async findAllWithData() {
        return await this.prismaModel.findMany();
    }
    async findAllWithPagination(page: number, limit: number) {
        const skip = (page - 1) * limit;
        return await this.prismaModel.findMany({
            skip,
            take: limit,
            select: {
                data: false
            }
        });
    }
    async findAll(select: any) {
        return await this.prismaModel.findMany({
            select: select
        })
    }
    async findById(id: string) {
        return await this.prismaModel.findUnique({
            where: { id }
        });
    }
    async create(data: any) {
        return await this.prismaModel.create({
            data
        });
    }
    async update(id: string, data: any) {
        return await this.prismaModel.update({
            where: { id },
            data
        });
    }
    async delete(id: string) {
        return await this.prismaModel.delete({
            where: { id }
        });
    }
}