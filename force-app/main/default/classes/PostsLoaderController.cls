public class PostsLoaderController {
    
    static final String POSTSURL = 'http://jsonplaceholder.typicode.com/posts';
    static final String COMMENTSURL = 'http://jsonplaceholder.typicode.com/comments';
    
    public class Comment{
        @AuraEnabled
        public Integer id;
        @AuraEnabled
        public Integer postId;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String email;
        @AuraEnabled
        public String body;
        
        public Comment(Integer sId, Integer pId, String n, String e, String b){
            id=sId; postId=pId; name=n; email=e; body=b;
        }
    }

    
    public class Post{
        @AuraEnabled
        public Integer userId;
        @AuraEnabled
        public Integer id;
        @AuraEnabled
        public String title;
        @AuraEnabled
        public String body;
        @AuraEnabled
        public List<Comment> comments;

        public Post(Integer uId, Integer i, String t, String b){
            userId=uId; id=i; title=t; body=b;
            comments=new List<Comment>();
        }
        public void setComments(List<Comment> c){
            if(c!=null)
            	comments=c.clone();
        }
    }
    
    public static String sendCallout(String url){
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        return res.getBody();
    }
    
    public static void seeData(){
        String postReturn= sendCallout(POSTSURL);
        String comReturn = sendCallout(COMMENTSURL);
        //System.debug(postReturn);
        //System.debug(comReturn);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Post> loadData(){
        //maps based on postId
        Map<Integer,List<Comment>> commentMap = new Map<Integer,List<Comment>>();
        Map<Integer,Post> postMap = new Map<Integer,Post>();
        //make post objects
        JSONParser parser = JSON.createParser(sendCallout(POSTSURL));
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                Post post = (Post)parser.readValueAs(Post.class);
                postMap.put(post.id, post);
            }
        }
        //make comment objects
        parser = JSON.createParser(sendCallout(COMMENTSURL));
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                Comment com = (Comment)parser.readValueAs(Comment.class);
                List<Comment> cList=commentMap.get(com.postId);
                if(cList==null) 
                    cList=new List<Comment>();
                cList.add(com);
                commentMap.put(com.postId, cList);
            }
        }
        List<Post> allData= new List<Post>();
        //linking comments to post
        for(Integer postId : commentMap.keySet()){
            List<Comment> cList = commentMap.get(postId);
            Post p = postMap.get(postId);
            p.setComments(cList);
            allData.add(p);
        }
        return allData;
        //return sendCallout(POSTSURL)
    }
}