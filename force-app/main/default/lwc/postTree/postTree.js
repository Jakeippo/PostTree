
import { LightningElement, track, api } from 'lwc';

export default class PostTree extends LightningElement {
    
    @api treeData;
    @api isLoading = false;

}