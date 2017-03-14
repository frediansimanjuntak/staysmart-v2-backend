import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import attachmentsSchema from '../model/attachments-model';
import {AWSService} from '../../../../global/aws.service';

attachmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Attachments
          .find(_query)
          .exec((err, attachments) => {
              err ? reject(err)
                  : resolve(attachments);
          });
    });
});

attachmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Attachments
          .findById(id)
          .exec((err, attachments) => {
              err ? reject(err)
                  : resolve(attachments);
          });
    });
});

attachmentsSchema.static('createAttachments', (attachments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(attachments)) {
        return reject(new TypeError('Attachment is not a valid object.'));
      }
      var files = [].concat(attachments);
      var idAtt = [];
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

            AWSService.upload(key, file).then(fileDetails => {
              var _attachment = new Attachments(attachments);
              _attachment.name = fileDetails.name;
              _attachment.type = fileDetails.type;
              _attachment.key = fileDetails.url;
              _attachment.size = files[i].size;    
              _attachment.save((err, saved) => {
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
              idAtt.push(idattach);
               
              if (i >= files.length - 1){
                if(errAtt == 0) {
                  resolve({idAtt, errAtt});  
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
          if(errAtt == 0) {
            attachmentfile();
          }
      }
      else {
        resolve({message: "success"});
      }
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
              err ? reject(err)
                  : resolve({message: "delete success"});
          });

    });
});


let Attachments = mongoose.model('Attachments', attachmentsSchema);

export default Attachments;
