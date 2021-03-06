import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import attachmentsSchema from '../model/attachments-model';
import {AWSService} from '../../../../global/aws.service';
import config from '../../../../config/environment/index';

attachmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        
        Attachments
          .find(_query)
          .exec((err, attachments) => {
              err ? reject({message: err.message})
                  : resolve(attachments);
          });
    });
});

attachmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Attachments
          .findById(id)
          .exec((err, attachments) => {
              err ? reject({message: err.message})
                  : resolve(attachments);
          });
    });
});

attachmentsSchema.static('createAttachments', (attachments:Object, request:Object, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(attachments)) {
        return reject(new TypeError('Attachment is not a valid object.'));
      }
      let data: any = request;
      var files = [].concat(attachments);
      var idAtt = [];
      var urlAtt =[];
      var errAtt = 0;

      if(files.length > 0)
      {
          var i = 0;
          var attachmentfile = function() {
            let file:any = files[i];
            let key:string = 'attachment/'+file.name;
            if(files[i].size >= 8388608) {
              for(var j =0; j < idAtt.length; j++){
                Attachments.deleteAttachments(idAtt[j]);
              }
              reject({message: "Error uploading your images, file size to large"});
            }
            else{
              AWSService.upload(key, file).then(fileDetails => {
                var fileName = fileDetails.name.replace(/ /g,"%20");
                var _attachment = new Attachments(attachments);
                if (data.body) {
          				_attachment.metadata = data.body;
          			}
                _attachment.name = fileDetails.name;
                _attachment.type = fileDetails.type;
                _attachment.key = 'attachment/'+fileName;
                _attachment.size = files[i].size;    
                _attachment.save((err, saved) => {
                  let url = saved.url;
                  if(err != null) 
                  {
                    errAtt = errAtt + 1;
                    for(var j =0; j < idAtt.length; j++){
                      Attachments.deleteAttachments(idAtt[j]);
                    }
                    reject({message: "Error uploading your images"});
                  }                
                });

                let idattach = _attachment.id; 
                let url = _attachment.url; 
                idAtt.push(idattach);
                urlAtt.push(url);
                 
                if (i >= files.length - 1){
                  if(errAtt == 0) {
                    if (device != 'desktop') {
                      if (data.body && data.body.row_id) {
                        resolve({
                          imgId: idAtt[0],
                          row_id: data.body.row_id,
                          message: 'Success'
                        });
                      }
                      else {
                        resolve({
                          imgId: idAtt[0],
                          message: 'Success'
                        });
                      }
                    }
                    else {
                      resolve({idAtt, urlAtt, errAtt});    
                    }
                  }
                  else{
                    resolve({errAtt});
                  }
                }
                else {
                  i++;
                  if(errAtt == 0) {
                    attachmentfile();
                  }
                }              
              })
            }
          }
          if(errAtt == 0) {
            attachmentfile();
          }
      }
      else {
        resolve({message: "success"});
      }
    });
});

attachmentsSchema.static('deleteManyAttachments', (data:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;
        Attachments
          .remove( { _id : { $in: body.ids} } )
          .exec((err, result) => {
              err ? reject({message: err.message})
                  : resolve(result);
          })
    });
});

attachmentsSchema.static('deleteAttachments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Attachments
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              if (err == null && deleted == null) {
              	reject({error: true, message: 'No attachment with that id.'});
              }
              else if(err == null && deleted != null) {
              	resolve({error: false, code: 200, message: 'success.'});
              }
          });

    });
});


let Attachments = mongoose.model('Attachments', attachmentsSchema);

export default Attachments;
