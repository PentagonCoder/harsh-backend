import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile : {
      type : String,
      required : true,
    },
    thumbnail : {
      type : String,
      required : true,
    },
    title : {
      type : String,
      required : true,
    },
    description : {
      type : String,
      required : true,
    },
    duration : {
      type : Number,
      required : true,
    },
    views : {
      type : Number,
      default : 0,
    },
    isPublished : {
      type : Boolean,
      default : true,
    },
    owner : {
      type : Schema.Types.ObjectId,
      ref : "User",
      required : true,
    }
  },
  {
    timestamps : true
  }
)
// Add pagination plugin to the schema to enable pagination functionality in the Video model. 
// This allows us to easily paginate through video records when querying the database, improving performance and user experience when dealing with large datasets.
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);