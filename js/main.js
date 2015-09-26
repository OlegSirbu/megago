document.addEventListener("DOMContentLoaded", function() {

    //getting data for items list
    (function(){
        var data=[];
        // if have values in localStorage take from there
        if(localStorage.length>0 && localStorage.getItem('store-name')){
            var arr = localStorage.getItem('store-name').split(',');
            if(arr.length>1){
                arr.forEach(function(i){
                    data.push(
                        JSON.parse(localStorage.getItem('store-name-'+i))
                    );
                });
                Init(data);
            }
        } else {
            //get json from server
            $.ajax({
                url: 'data.json',
                dataType: 'json',
                success: function(data){
                    Init(data);
                }
            });
        }
    })();

    // init items list
    function Init(data){

        var ItemModel = Backbone.Model.extend({});

        var ItemView = Backbone.View.extend({
            template: _.template(' <span class="row edit"><%= name %>  <%= phone %> </span>'),
            editTemplate: _.template('<input class="name" value="<%= name %>" /> <input class="phone" value="<%= phone %>" /><button class="save">Save</button>'),

            events: {
                "click .edit": "editItem",
                "click .save": "saveItem"
            },

            editItem: function(){
                this.$el.html(this.editTemplate(this.model.toJSON()));
            },

            saveItem: function(){
                //getting values from input and save in model
                var self = this;

                // getting values from input and create obj for update
                function gettingValues(classNames){
                    var values = [];
                    classNames.forEach(function(className){
                        var obj = {};
                        obj[className] = $(self.el).find('input.'+className).val();
                        values.push(obj);
                    });
                    return values;
                }

                // save new values in model
                function updateDataInModel(storeModels){
                    storeModels.forEach(function(newModel){
                        self.model.save(newModel);
                    });
                }
                updateDataInModel(gettingValues(['name','phone']));

                // render new data in html
                this.$el.html(this.template(this.model.toJSON()));
            },

            render: function(){
                var attributes = this.model.toJSON();
                this.$el.append(this.template(attributes));
                return this;
            }
        });

        var ItemsList = Backbone.Collection.extend({
            model: ItemModel,
            localStorage: new Store("store-name")
        });

        var itemsList = new ItemsList;

        var ItemsListView = Backbone.View.extend({
            el: $('#main'),

            initialize: function () {
                this.render();
                this.collection.on("add", this.renderItem, this);
            },

            render: function(){
                _.each(this.collection.models, function (items) {
                    this.renderItem(items);
                }, this);
            },

            renderItem: function(items) {
                //rendering and save in localStorage
                var itemView = new ItemView({ model: items });
                items.save();
                this.$el.append(itemView.render().el);
            }

        });

        var itemsListView = new ItemsListView({collection: itemsList});
        itemsList.add(data);
    }
});


