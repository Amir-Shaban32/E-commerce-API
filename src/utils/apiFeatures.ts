import mongoose , {HydratedDocument} from "mongoose"

class ApiFeatures<T> {

    model:mongoose.Query<HydratedDocument<T>[],mongoose.HydratedDocument<T>>;
    query:Record<string , unknown>;
    constructor(
        model: mongoose.Query<HydratedDocument<T>[],mongoose.HydratedDocument<T>>,
        query:Record<string , unknown>
    ){
        this.model = model;
        this.query = query;
    }
    
    filter(){
        
        const reqQuery = {...this.query};
        console.log(reqQuery);
        const excludeFields = ['sort', 'limit', 'fields', 'page', 'date_from', 'date_till'];
        excludeFields.forEach(element => delete reqQuery[element]);
      
        // Handle comparison operators
        const queryStr = JSON.stringify(reqQuery).replace(
          /\b(gte|gt|lte|lt|ne)\b/g,
          match => `$${match}`
        );
        console.log(queryStr);
        const queryObj = JSON.parse(queryStr);

        for(const key in queryObj){
            if(queryObj[key] === 'true') queryObj[key] = true;
            if(queryObj[key] === 'false') queryObj[key] = false;

            if(!isNaN(queryObj[key] as any) && queryObj[key] !== '' && typeof queryObj[key] === 'string')
                queryObj[key] = Number(queryObj[key]);
        }


        if(this.query.date_from || this.query.date_till)
        {
            const dateFilter:{$gte?:Date ; $lte?:Date} = {};
            if(this.query.date_from)
            {
                dateFilter.$gte = parseDate(this.query.date_from);
            }
            if(this.query.date_till)
            {
                dateFilter.$lte = parseDate(this.query.date_till);
            }
            queryObj.created_at = dateFilter;
        }

        console.log('final query object' , queryObj);
        this.model = this.model.find(queryObj);
        return this;
    }

    //sort
    sort(){
        if(this.query.sort)
        {
            const sortParameters = (this.query.sort as string).split(',').join(' ');
            this.model.sort(sortParameters);
        }
        return this;
    }

    //limit fields
    limitFields(){
        if(this.query.fields)
        {
            const fields = (this.query.fields as string).split(',').join(' ');
            this.model.select(fields);
        }
        return this;
    }

    //paginate
    paginate(){
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page-1) * limit;

        this.model.skip(skip).limit(limit);
        return this;
    }

}

function parseDate(value:any):Date{
    const [day,month,year] = value.split('-').map(Number);
    return new Date(year , month-1 , day);
}

export default ApiFeatures;