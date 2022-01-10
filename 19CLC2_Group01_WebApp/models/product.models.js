import db from '../utils/db.js'
export default {
    findAll(){
        return db.select().table('Product');
    },

    async findById(id){
        const list =  await db('Product').where('ProID', id).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findCatIDByProID(proID){
        const list =  await db('Product').where('ProID', proID)
        if(list.length === 0){
            return null
        }
        return list[0].CatID2;
    },

    deleteCate(id){
        console.log(id)
        return db('Product').where('ProID', id).del()
    },

    patchCate(entity){
        const id = entity.CatID;
        delete entity.id;
        return db('Product').where('ProID', id).update(entity)
    },

    findByCatID(CatID){
        return db('Product').where('CatID2', CatID)
    },

    findPageByCatID(CatID, limit, offset){
        return db('Product').where('Product.CatID2', CatID).limit(limit).offset(offset ).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
    },

    async countByCatID(CatID){
        const list = await db('Product').where('CatID2', CatID).count({amount: 'ProID' })
        return list[0].amount
    },

    async getRelateProduct(CatID2, ProID){
        const list = await db('Product').where('CatID2', CatID2).andWhereNot('ProID', ProID).limit(5);
        return list;
    },

    async getCatID2FromProID(ProID){
        const CatID2 = await db('Product').select('Product.CatID2').where('ProID', ProID);
        return CatID2[0]
    },

    async getCatID1FromCatID2(CatID2){
        const CatID1 = await db('CategoryL2').select('CategoryL2.CatID1').where('CatID2', CatID2);
        return CatID1[0]
    },



    // Khang
    addToWatchList(entity){
        return db('WatchList').insert(entity);
    },

    delFromWatchList(entity){
        return db('WatchList').where({
            'UserID': entity.UserID,
            'ProID': entity.ProID
        }).del();
    },

    async countWatchList(userID){
        if(userID === null){
            console.log(userID)
            return null
        }
        const lst = await db('WatchList').count({ WatchListCount: 'UserID' }).where('UserID',userID);
        return lst[0].WatchListCount;
    },

    async getWatchListFromUserID(id, limit, offset){
        const lst = await db('Product').join('WatchList', 'Product.ProID',
            '=', 'WatchList.ProID').where('WatchList.UserID', id).limit(limit).offset(offset).select();
        return lst;
    },
    // Khang

    async getWatchListByUserID(userID){
        const list = await db('WatchList').where('UserID', userID)
        if (list.length === 0){
            return null
        }
        return list
    },

    // Minh
    findAllWithIdCate(){
        return db.select().table('Product').join('CategoryL2','Product.CatID2','=','CategoryL2.CatID2');
    },

    // Đếm số lượng product
    async countProduct(){
        let now=new Date();
        const list = await db('Product').whereNull('Winner').andWhere('EndDate','>=',now).count({amount: 'ProID' })
        return list[0].amount
    },

    // Lấy toàn bộ product chia bởi page
    findPageByProduct(limit, offset){
        let now=new Date();
        return db.select().table('Product').join('CategoryL2','Product.CatID2','=','CategoryL2.CatID2').whereNull('Winner').andWhere('EndDate','>=',now).orderBy('Product.ProID').limit(limit).offset(offset);
    },

    findBidderByProId(ProID){
        return db.select().table('User').join('MaxPrice','MaxPrice.UserID','=','User.UserID').where('MaxPrice.ProID',ProID);
    },

    findSellerByProId(ProID){
        return db.select().table('User').join('Product','Product.UploadUser','=','User.UserID').where('Product.ProID',ProID);
    },

    delPermisByProId(ProID){
        return db('Permission').where('ProID', ProID).del();
    },

    delMaxPriceByProId(ProID){
        return db('MaxPrice').where('ProID', ProID).del();
    },

    delAuctionByProId(ProID){
        return db('Auction').where('ProID', ProID).del();
    },

    delDescriptionByProId(ProID){
        return db('DescriptionHistory').where('ProID', ProID).del();
    },

    delWatchListByProId(ProID){
        return db('WatchList').where('ProID', ProID).del();
    },

    delProInfoSearchByProId(ProID){
        return db('ProInfoSearch').where('ProID', ProID).del();
    },

    delProductByProId(ProID){
        return db('Product').where('ProID', ProID).del();
    },
}