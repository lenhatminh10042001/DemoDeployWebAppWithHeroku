import {engine} from "express-handlebars";
import numeral from "numeral";
import moment from 'moment'; //format date.
import hbs_sections from 'express-handlebars-sections';
//handlebar

export default function(app){
    //handlebars.
    app.engine('hbs', engine({
        defaultLayout: 'bs4.hbs', //cần phải ghi đuôi file.hbs, về sau không cần ghi .hbs
        helpers: {
            format_number(val){
                return numeral(val).format('0,0')
            },

            increase_one(val){
                return parseInt(val)+1;
            },

            decrease_one(val){
                return parseInt(val)-1;
            },
            section: hbs_sections(),

            ifCond(v1, v2, options) {
                if(v1 === v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },

            formatDate(val){
                console.log(moment.utc(val).format('DD/MM/YYYY'))
                return moment.utc(val).format('DD/MM/YYYY')
            },
            formatDateCountdown(val){
                return moment.utc(val).format('MM/DD/YYYY')
            }
        }
    }));
    app.set('view engine', 'hbs');
    app.set('views', './views');
}
