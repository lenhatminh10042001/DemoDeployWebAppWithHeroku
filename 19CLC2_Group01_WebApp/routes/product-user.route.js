//admin/categories
import express from 'express';
import productModel from '../models/product.models.js'
import auth from '../middlewares/auth.mdw.js'
const router = express.Router();
//Khuong.
router.get('/byCat/:id', async function(req, res){
    const catID2 = req.params.id || 0
    req.session.retURL = req.originalUrl

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === catID2){
            c.isActive = 1;
            break
        }
    }

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.isActive === 1){
            for (const d of res.locals.CategoryL1){
                if (d.CatID1 === c.CatID1){
                    d.isActive = 1;
                    break;
                }
            }
        }
    }

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await productModel.countByCatID(catID2)
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }

    const list = await productModel.findPageByCatID(catID2, limit, offset)

    //check wwhich product selected in watch list
    if (res.locals.WatchListByUSerID != null){
        for(const c of list){
            for (const d of res.locals.WatchListByUSerID){
                if (c.ProID === d.ProID){
                    c.isWatchList = 1;
                }
            }
        }
    }
    const isLogin = req.session.auth || false
    console.log(isLogin)

    res.render('vwProducts/byCat', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
})

router.get('/detail/:id', async function(req, res){
    //const catID = req.query.id || 0
    req.session.retURL = req.originalUrl
    const proID = req.params.id || 0
    var CatID = await productModel.findCatIDByProID(proID)
    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === CatID){
            c.isActive = 1;
            break
        }
    }

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.isActive === 1){
            for (const d of res.locals.CategoryL1){
                if (d.CatID1 === c.CatID1){
                    d.isActive = 1;
                    break;
                }
            }
        }
    }


    const product = await productModel.findById(proID)
    const catID2 = await productModel.getCatID2FromProID(proID)
    const catID1 = await productModel.getCatID1FromCatID2(catID2.CatID2)
    const list5Relate = await productModel.getRelateProduct(catID2.CatID2, proID)

    for (const c of list5Relate){
        c.CatID1 =  catID1.CatID1
    }


    if(product===null){
        return res.redirect('/')
    }
    res.render('vwProducts/detail', {
        product,
        empty: product.length === 0,
        list5Relate,
        Category1: catID1.CatID1,

    })
})
//Khuong.

// Khang
router.get('/WatchList', auth, async function (req, res){

    req.session.retURL = req.originalUrl
    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const userID = req.session.authUser.UserID
    const total = await productModel.countWatchList(userID);
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }


    const WatchList = await productModel.getWatchListFromUserID(userID, limit, offset);

    for (const obj of WatchList){
        const CatID2 = obj.CatID2;
        const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
        obj.CatID1 = CatID1.CatID1;
    }

    res.render('vwProducts/watchList', {
        products: WatchList,
        empty: WatchList.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages
    })
})

router.post('/addWatchList', async function (req, res){
    req.session.retURL = req.originalUrl
    const id = req.body.ProID;
    console.log(id);

    const userid = req.session.authUser.UserID || ''
    const entity = {
        UserID: userid,
        ProID: id
    };
    const ret = await productModel.addToWatchList(entity);
    if (req.body.ProStatus === undefined){
        const obj = await productModel.getCatID2FromProID(id);
        res.redirect(`/products/byCat/${obj.CatID2}`);
    }
    else
        res.redirect(`/products/detail/${id}`)
});

router.post('/delWatchList', async function(req, res){
    req.session.retURL = req.originalUrl
    const id = req.body.ProID;
    const userid = req.session.authUser.UserID || ''
    const entity = {
        UserID: userid,
        ProID: id
    };
    const ret = await productModel.delFromWatchList(entity);
    const url = req.headers.referer || '/'
    res.redirect(url)
});
// Khang
export default router;