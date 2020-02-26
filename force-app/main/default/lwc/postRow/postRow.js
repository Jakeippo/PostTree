import { LightningElement, api, track } from 'lwc';

export default class PostRow extends LightningElement {
    @api post;
    @api selected=false;
    @track expanded=false;

    toggleExpand(){
        this.expanded = !this.expanded;
    }
}