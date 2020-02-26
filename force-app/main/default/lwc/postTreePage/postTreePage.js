import { LightningElement, wire, track } from 'lwc';

import loadData from '@salesforce/apex/PostsLoaderController.loadData';

export default class PostTreePage extends LightningElement {
    
    @track allData;
    @track error;
    pageData=[];

    pageNumber=1;
    itemsPerPage=10;

    @track treeLoading=true;

    itemOptions=[{label:'5',value: 5},
                {label:'10',value: 10},
                {label:'25',value: 25},
                {label:'50',value: 50}];

    pageOptions=[{label:'1',value: 1}];

    @wire(loadData)
    allPosts({error, data}) {
        if(data){
            this.allData=setData(data);
            this.error=undefined;
            this.setOptions();
            this.shiftData();
        }else if (error){
            this.treeData=[];
            this.error='ERROR occured while loading: '+JSON.stringify(error);
            this.treeLoading=false;
        }else{
            console.log('no data');
        }
    }

    handleLoad(){
        this.treeLoading=true;
        loadData().then(result=>{
            this.allData=setData(result);
            this.pageNumber=1;
            this.setOptions();
            this.shiftData();
        })
    }
    goPrev(){
        if(this.pageNumber>1){
            this.treeLoading=true;
            this.pageNumber--;
            this.shiftData();
        }
            
    }
    goNext(){
        if(this.pageNumber*this.itemsPerPage < this.allData.length){
            this.treeLoading=true;
            this.pageNumber++;
            this.shiftData();
        }
            
    }
    shiftData(){
        var offset = (this.pageNumber-1)*(this.itemsPerPage);
        var end = +offset + +this.itemsPerPage;     //;)
        var newData = this.allData.slice(offset, end);
        this.pageData=newData;
        this.treeLoading=false;
    }

    handleItemsChange(event) {
        this.treeLoading=true;
        this.itemsPerPage = event.detail.value;
        this.pageNumber=1;
        this.setOptions();
        this.shiftData();
    }
    handlePageJump(event) {
        this.treeLoading=true;
        this.pageNumber =  event.detail.value;
        this.shiftData();
    }

    setOptions(){
        var options=[];
        var count=1;
        var i=1;
        while(count<this.allData.length){
            var op ={"label":i, "value":i};
            options.push(op);
            i++;
            count+= +this.itemsPerPage;
        }
        this.pageOptions=options;
    }

}
const setData = (postsLoaded) => {
    console.log(postsLoaded.length+' posts loaded');
    var data = {...postsLoaded};
    var aData = [];
    if(data){
        var i=0;
        while(data[i]){
            var p = data[i]
            aData.push(p);
            i++;
        }
        //map data with table fields
        aData = aData.map(post =>({
            id:post.id, 
            userId:post.userId,
            title:post.title,
            body:post.body,
            comments: post.comments.map(com => ({
                id : com.id,
                title : com.name,
                body: com.body,
                email: com.email
            }))
        }));
    }
    return aData;
}