import { PrismaClient } from "@prisma/client";

export class BaseController {
    constructor(private readonly prismaModel:any){}
    async findAllWithData(){
        return await this.prismaModel.findAll();
    }
    async findAllWithPagination(page:number,limit:number){
        return await this.prismaModel.findAllWithPagination(page,limit, {
            select:{
                data:false
            }
        });
    }
    async findAll(){
        return await this.prismaModel.findAll({
            select:{
                data:false
            }
        })
    }
    async findById(id:string){
        return await this.prismaModel.findById(id);
    }
    async create(data:any){
        return await this.prismaModel.create(data);
    }
    async update(id:string,data:any){
        return await this.prismaModel.update(id,data);
    }
    async delete(id:string){
        return await this.prismaModel.delete(id);
    }
}