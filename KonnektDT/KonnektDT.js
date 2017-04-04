define([],function(){
  function CreateKonnektDT(data,name,parent,scope)
  {
    var _events = {
          "set":[],
          "postset":[],
          "create":[],
          "postcreate":[],
          "delete":[],
          "postdelete":[],
          "splice":[],
          "postsplice":[],
          "push":[],
          "postpush":[],
          "pop":[],
          "postpop":[],
          "shift":[],
          "postshift":[],
          "unshift":[],
          "postunshift":[],
          "fill":[],
          "postfill":[],
          "reverse":[],
          "postreverse":[],
          "sort":[],
          "postsort":[],
          "addlistener":[],
          "postaddlistener":[],
          "removelistener":[],
          "postremovelistener":[],
          "addchildlistener":[],
          "postaddchildlistener":[],
          "removechildlistener":[],
          "postremovechildlistener":[]
        },
        
        _ignoreList = ['__proto__'],
        
        _loopEvents = function(events,e)
        {
            if(!e._stopPropogration && events)
            {
              for (var x = 0, len = events.length; x !== len; x++) 
              {
                  events[x](e);
                  if (e._stopPropogration) break;
              }
            }
        },

        _onevent = function(e)
        {
          if(e.listener)
          {
            var _local = e.local[e.listener],
                _child = e.local[(e.listener.replace('__kb','__kbparent'))];
            
            /* Local */
            if(isObject.call(_local))
            {
              _loopEvents(_local[e.key],e);
              _loopEvents(_local['*'],e);
            }
            else
            {
              _loopEvents(_local,e);
            }
            
            /* Child */
            if(isObject.call(_child))
            {
              _loopEvents(_child[e.key],e);
              _loopEvents(_child['*'],e);
            }
            else
            {
              _loopEvents(_child,e);
            }
          }
          
          _loopEvents(e.local.__kbref.__kbevents[e.type],e);
          
          return e._preventDefault;
        }

    if(!Object.prototype._toString) Object.prototype._toString = Object.prototype.toString;
    if(!Object._keys) Object._keys = Object.keys;

    Object.prototype.toString = function(){
      if(this instanceof Mixed) return "[object Mixed]";
      return Object.prototype._toString.apply(this,arguments);
    }

    Object.keys = function(v,type){
      return Object._keys(v)
      .filter(function(k){
        return ((!type) || ((type === 'object' || type === 'o')) ? (isNaN(parseInt(k,10))) : (type === 'all' ? true : (!isNaN(parseInt(k,10)))));
      });
    };

    Object.defineProperties(Object.prototype,{
      
    });

    /* The Main constructor */
    function Mixed(data,name,parent,scope)
    {
      data = (data === undefined ? {} : data);
      /* Object prototype extensions chained down to the function */;

      var KonnektDT = {};

      if(typeof Proxy === 'undefined') return console.error("There is no support for proxies! This library can not be used here, please update Your js library or browser");

      var prox = new Proxy(KonnektDT, {set:proxySet,deleteProperty:proxyDelete}),
          keys = Object.keys(data,'all');

      Object.defineProperties(KonnektDT,{
        __kbname:setDescriptor((typeof name === 'string' ? name : "default"),true,true),
        __kbref:setDescriptor((parent ? (parent.__kbref || parent) : prox),true,true),
        __kbscopeString:setDescriptor((scope || ""),true,true),
        __kbImmediateParent:setDescriptor((parent || null),true,true),
        __kbsubscribers:setDescriptor({}),
        __kblisteners:setDescriptor({}),
        __kbupdatelisteners:setDescriptor({}),
        __kbparentlisteners:setDescriptor({}),
        __kbparentupdatelisteners:setDescriptor({}),
        __kbcreatelisteners:setDescriptor([]),
        __kbdeletelisteners:setDescriptor([]),
        __kbparentcreatelisteners:setDescriptor([]),
        __kbparentdeletelisteners:setDescriptor([]),
        __kbpointers:setDescriptor({}),
        __kbevents:setDescriptor(_events),
        length:setDescriptor(0,true),
        __kbnonproxy:setDescriptor(KonnektDT,false,true),
        _stopChange:setDescriptor(false,true)
      });

      for(var x=0,len=keys.length;x<len;x++)
      {
        prox[keys[x]] = data[keys[x]];//(data[keys[x]] === 'object'? Mixed(data[keys[x]],name,prox,scope+(scope.length !== 0 ? "." : "")+keys[x]) : data[keys[x]]);
      }
      
      KonnektDT.__proto__ = Mixed.prototype;
      
      /* clear listeners */
      KonnektDT.__kbevents.addlistener = [];
      KonnektDT.__kbevents.removelistener = [];
      
      KonnektDT.addActionListener('addlistener',function(e){
        if(typeof e.arguments[0] === 'string' && e.local.__kbpointers[e.arguments[0]] !== undefined)
        {
          e.local.__kbpointers[e.arguments[0]][e.arguments[2]](e.arguments[0],e.arguments[1]);
        }
      })
      .addActionListener('removelistener',function(e){
        if(typeof e.arguments[0] === 'string' && e.local.__kbpointers[e.arguments[0]] !== undefined)
        {
           e.local.__kbpointers[e.arguments[0]][e.arguments[2]](e.arguments[0],e.arguments[1]);
        }
      })

      return prox;
    }

    /* Helper methods and the main proxy Methods */
    function eventObject(obj,key,type,value,oldValue,args,listener,stopChange)
    {
      this.stopPropogation = function(){this._stopPropogration = true;}
      this.preventDefault = function(){this._preventDefault = true;}
      this.local = obj;
      this.key = key;
      this.arguments = args;
      this.event = type;
      this.type = type;
      this.listener = listener;
      this.name = obj.__kbname;
      this.root = obj.__kbref;
      this.scope = obj.__kbscopeString;
      this.parent = obj.__kbImmediateParent;
      this.value = value;
      this.oldValue = oldValue;
      this.stopChange = stopChange;
    }

    function setDescriptor(value,writable,redefinable,enumerable)
    {
      return {
          value:value,
          writable:!!writable,
          enumerable:!!enumerable,
          configurable:!!redefinable
      }
    }

    function setCustomDescriptor(func,writable,redefinable)
    {
      return {
        get:function(){
          return func.call(this);
        },
        set:function(v){if(!!writable) func = v;},
        enumerable:false,
        configurable:!!redefinable
      }
    }

    function setBindDescriptor(key,value)
    {
      var _value = value,
          _oldValue = value,
          _key = key,
          _set = function(v,e)
          {
              _oldValue = _value;
              _value = v;
            if(!e.stopChange)
            {
              e.listener = '__kbupdatelisteners';
              e.type = 'postset';
              _onevent(e);
            }
          };
      return {
          get:function(){
              return _value;
          },
          set:function(v)
          {
              var e = new eventObject(this,_key,'set',v,_value,arguments,'__kblisteners',this._stopChange);
              if(_onevent(e) !== true)
              {
                 _set(v,e);
                if(!this._stopChange) this.callSubscribers(_key,_value,_oldValue);
              }
              this._stopChange = false;
          },
          configurable:true,
          enumerable:true
      }
    }

    function setPointer(obj,prop,desc)
    {
      return {
          get:function(){
              return obj[prop];
          },
          set:function(v){

            (this._stopChange ? obj.stopChange() : obj)[prop] = v;
            this._stopChange = false;
          },
          enumerable:desc.enumerable,
          configurable:desc.configurable
      }
    }

    function parseParentListenersToNewObjects(mixed,target)
    {
      var listeners = [
        {listener:'__kbparentlisteners',action:'addChildListener'},
        {listener:'__kbparentupdatelisteners',action:'addChildUpdateListener'},
        {listener:'__kbparentcreatelisteners',action:'addChildCreateListener'},
        {listener:'__kbparentdeletelisteners',action:'addChildDeleteListener'}],
          keys = [],
          _currListener;
      
      for(var x=0,len=listeners.length;x<len;x++)
      {
        _currListener = mixed[listeners[x].listener];
        if(isObject.call(_currListener))
        {
          keys = Object.keys(_currListener);
          for(var i=0,lenI=keys.length;i<lenI;i++)
          {
            for(var z=0,lenZ=_currListener[keys[i]].length;z<lenZ;z++)
            {
              target[listeners[x].method](keys[i],_currListener[keys[i]][z]);
            }
          }
        }
        else
        {
          for(var i=0,lenI=_currListener.length;i<lenI;i++)
          {
            target[listeners[x].method](_currListener[i]);
          } 
        }
      }
    }
    
    function parsePointerEvents(target,key)
    {
      var events = [
        {listeners:'__kblisteners',method:'addDataListener'},
        {listeners:'__kbupdatelisteners',method:'addDataUpdateListener'}
      ],
      keys = [],
      _currListener;
      if(target[key].__kbImmediateParent)
      {
        for(var x=0,len=events.length;x<len;x++)
        {
          _currListener = target[events[x].listener];
          keys = Object.keys(_currListener);
          for(var i=0,lenI=keys.length;i<lenI;i++)
          {
            if(key === keys[x])
            {
              for(var z=0,lenZ=_currListener[keys[x]].length;z<lenZ;z++)
              {
                  if(target[key].__kbImmediateParent[events[x].listener][key] === undefined) target[key].__kbImmediateParent[events[x].listener][key] = [];
                  target[key].__kbImmediateParent[events[x].listener][key].push(_currListener[keys[x]][z]);
              }
            }
          }
        }
      }
      parseParentListenersToNewObjects(target,target[key]);
    }
    
    function handleNewObject(target,key,value,isCreated)
    {
      value = new Mixed(value,target.__kbname,target,(target.__kbscopeString+(target.__kbscopeString.length !== 0 ? "." : "")+key));
            
      parseParentListenersToNewObjects(target,value);
      
      if(isCreated)
      {
        var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
          onEvent = _onevent(e);
        if(onEvent !== true)
        {
          Object.defineProperty(target,key,setBindDescriptor(key,value));
          e.listener = '__kbupdatelisteners';
          e.type = 'postcreate';
          _onevent(e);
        }
        return (onEvent !== true);
      }
      else
      {
        var e = new eventObject(target,key,'set',value,undefined,[],'__kblisteners',target._stopChange),
          onEvent = _onevent(e);
        if(onEvent !== true)
        {
          Object.defineProperty(target,key,setBindDescriptor(key,value));
          e.listener = '__kbupdatelisteners';
          e.type = 'postset';
          _onevent(e);
        }
        return (onEvent !== true);
      }
      
    }
    
    function handleNewMixed(target,key,value,isCreated)
    {
      if(isCreated)
      {
        var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
            onEvent = _onevent(e);
        if(onEvent !== true)
        {
          var desc = Object.getOwnPropertyDescriptor(value.__kbImmediateParent,key);
          Object.defineProperty(target,key,setPointer(value.__kbImmediateParent,key,desc));
          target.__kbpointers.push(key);

          parsePointerEvents(target,key)

          e.listener = '__kbupdatelisteners';
          e.type = 'postcreate';
          _onevent(e);
        }
        return (onEvent !== true);
      }
      else
      {
        var desc = Object.getOwnPropertyDescriptor(value.__kbImmediateParent,key);
        Object.defineProperty(target,key,setPointer(value.__kbImmediateParent,key,desc));
        target.__kbpointers.push(key);
        parsePointerEvents(target,key);
        return true;
      }
      
    }
    
    /* create check if value is just undefined but descriptor is set */
    function proxySet(target,key,value)
    {
      if(!isObservable.call(target,key) && key !== 'length')
      {
        if(!isNaN(parseInt(key,10)))
        {
          key = parseInt(key,10);
          if(target.length <= key) target.length = (key+1);
        }
        if(target._stopChange || key === '_stopChange')
        {
          target[key] = value;
          return true;
        }
        else
        {
          if(_ignoreList.indexOf(key) === -1)
          {
            /* A new property was added */
            if(typeof value === 'object' && !(value instanceof Node))
            {
              return handleNewObject(target,key,value,true);
            }
            else if(value instanceof Mixed)
            {
              return handleNewMixed(target,key,value,true);
            }
            else
            {
              var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
                onEvent = _onevent(e);
              if(onEvent !== true)
              {
                Object.defineProperty(target,key,setBindDescriptor(key,value));
                e.listener = '__kbupdatelisteners';
                e.type = 'postcreate';
                _onevent(e);
              }
              return (onEvent !== true);
            }
          }
        }
      }
      else
      {
        if(key === 'length')
        {
          if(value > target.length && target[(value-1)] !== undefined)
          {
            target.length = value;
          }
          else if(value < target.length)
          {
            for(var x=value,len=(target.length);x<len;x++)
            {
              if(target[x]) delete target[x];
            }
            target.length = value;
          }
        }
        else
        {
          if(typeof value === 'object' && !(value instanceof Node))
          {
            return handleNewObject(target,key,value);
          }
          else if(value instanceof Mixed)
          {
            return handleNewMixed(target,key,value);
          }
          else
          {
            target[key] = value;
          }
        }
        return true;
      }
    }
    
    /* Need to handle removing parentListeners prior to removal */
    function proxyDelete(target,key)
    {
      /* change size */
      if (!isNaN(parseInt(key, 10)) && target[key] === undefined)
      {
        target.length = (target.length-1);
      }
      else
      {
        target.del(key);
      }
      return true;
    }
    
    function recSet(from,to,key,val)
    {
      
    }
    
    function ignoreCreate(name)
    {
      if(_ignoreList.indexOf(name) === -1) _ignoreList.push(name);
      return this;
    }

    /* REGION Object extensions */
    
    function type(v)
    {
      return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    
    function sizeof(v)
    {
      var cache = [];

      function recGet(obj)
      {
        var keys = Object.keys(obj,'all'),
            count = 0,
            _curr = undefined;

        for(var x=0,len=keys.length;x<len;x++)
        {
          _curr = obj[keys[x]];
          if(typeof _curr === 'object' && _curr !== undefined && _curr !== null)
          {
            if(cache.indexOf(_curr) === -1)
            {
              cache.push(_curr);
              count += recGet(_curr);
            }
          }
          else if(typeof _curr === 'string')
          {
            count += (_curr.length * 2);
          }
          else if(typeof _curr === 'number')
          {
            count += 8;
          }
          else if(typeof _curr === 'boolean')
          {
            count += 4;
          }
          else if(typeof _curr === 'function')
          {
            count += (_curr.toString().length * 2);
          }
          count += (keys[x].length * 2);
        }
        return count;
      }

      return recGet((v || this))+" Bytes (Rough estimate)";
    }

    function isObject(v)
    {
      return (type((v !== undefined ? v : this)) === 'object');
    }

    function isArray(v)
    {
      return (type((v !== undefined ? v : this)) === 'array');
    }

    function isMixed(v)
    {
      return (type((v !== undefined ? v : this)) === 'mixed');
    }

    function isObservable(obj,prop)
    {
      prop = (typeof obj === 'string' ? obj : prop);
      obj = (typeof obj === 'string' ? this : obj);
      
      var desc = Object.getOwnPropertyDescriptor(obj,prop);

      return (desc ? (desc.value === undefined) : false);
    }

    function stringify(v)
    {
        var cache = [];
        return JSON.stringify((v || this),function(key, value) {
            if(isArray(value) || isObject(value))
            {
                if (cache.indexOf(value) !== -1)
                {
                    return;
                }
                cache.push(value);
            }
            return value;
        });
    }

    function getKeys(v,type)
    {
      type = (typeof v === 'string' ? v : (!type ? 'object' : type));
      v = (typeof v === 'string' || v === undefined ? this : v);

      return Object.keys(v,type);
    }

    function getIndexes(v)
    {
      v = (v !== undefined ? (typeof v === 'object' ? v : this[v]) : this);
      
      var _ret = [];
      for(var x=0,len=v.length;x<len;x++)
      {
        if(v[x] !== undefined) _ret[_ret.length] = x;
      }
      
      return _ret
    }

    function keyCount()
    {
      return this.getKeys('object').length;
    }

    function indexCount()
    {
      return (this).length;
    }

    function count()
    {
      return (this.keyCount + this.indexCount);
    }

    /* ENDREGION Object extensions */

    /* REGION Object methods */
    
    function add(key,value)
    {
      set.call(this,key,value);
      return this;
    }

    function set(key,value)
    {
      if(typeof key === 'number') key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.__kbnonproxy.setLayer(key) : this.__kbnonproxy);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      //add recSet here
      _layer[key] = value;
      return this;
    }
    
    /* Always return Proxy if used `.get` and `.getlayer` both apply this rule */
    function get(key)
    {
      if(typeof key === 'number') key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.getLayer(key) : this);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      if(_layer)
      {
        return _layer[key];
      }
      else
      {
        console.warn('Module: KonnektDT, Method: get, nothing exists on %o with the key %o',this,key);
      }
    }

    function exists(key)
    {
      var _layer = (key.indexOf('.') !== -1 ? this.__kbnonproxy.getLayer(key) : this.__kbnonproxy);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();

      if(!_layer) return !!_layer;

      return (_layer[key] !== undefined);
    }

    function addPrototype(key,value)
    {
      var _layer = (key.indexOf('.') !== -1 ? this.__kbnonproxy.setLayer(key) : this.__kbnonproxy);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      if(_layer[key] === undefined)
      {
        Object.defineProperty(_layer.__proto__,key,setDescriptor(value,true,true));
      }
      else
      {
        console.error('Your attempting to add your prototype with the prop %O that already exists on %O',prop,_layer);
      }
      return this;
    }

    /* Handle listener sharing (done in addlistener Methods) */
    function addPointer(passobj,prop,newprop)
    {
      if(!(passobj instanceof Mixed)) passobj = new Mixed(passobj,passobj.__kbname);

      var desc = Object.getOwnPropertyDescriptor(passobj,prop);
      Object.defineProperty(this.__kbnonproxy,(newprop || prop),setPointer(passobj,prop,desc));

      this.__kbnonproxy.__kbpointers[(newprop || prop)] = passobj;
    }
    
    /* handles all deleting */
    function del(key)
    {
      var _isNumber = (typeof key === 'number' || !isNaN(parseInt(key,10)));
      if(_isNumber) key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.getLayer(key) : this),
          _localProp = key.split('.').pop();
      
      if(!!_layer && _layer[_localProp] !== undefined)
      {
        if(_layer.length !== 0 && _isNumber)
        {
          _layer = _layer.__kbnonproxy;
          
          _layer.splice(_localProp,1);
          if(typeof window.Proxy !== 'undefined') proxyDelete(_layer,(_layer.length-1));
        }
        else
        {
          var e = new eventObject(_layer,key,'delete',_layer[_localProp],undefined,[],'__kbdeletelisteners',this._stopChange),
            onEvent = _onevent(e);

          if(onEvent !== true)
          {
            _layer = _layer.__kbnonproxy;
            
            Object.defineProperty(_layer,_localProp,setDescriptor(undefined,true,true,false));

            e.listener = '__kbupdatelisteners';
            e.type = 'postdelete';
            e.oldValue = e.value;
            e.value = undefined;
            _onevent(e);
          } 
        }
      }
      return this;
    }

    function move(obj,prop)
    {
      this[prop] = obj[prop];

      if(!(obj instanceof Mixed)) obj[prop] = null;
      delete obj[prop];
      return this;
    }

    function copy(obj,prop)
    {
      this[prop] = obj[prop];
      return this;
    }

    function merge(obj)
    {
      var cache = [];
      function recMerge(from,to)
      {
        var keys = (from instanceof Mixed ? from.keys('o') : Object.keys(from)),
            _curr;
        for(var x=0,len=keys.length;x<len;x++)
        {
          _curr = from[keys[x]];
          if(typeof _curr === 'object' && cache.indexOf(_curr) === -1 && to[keys[x]] !== 'undefined')
          {
            recMerge(_curr,to);
          }
          else
          {
            to[keys[x]] = _curr;
          }
        }
      }
      recMerge(obj,this);
      return this;
    }

    /* ENDREGION Object methods */

    /* REGION Array methods */

    function copyWithin(target,start,end)
    {
      start = (start || 0);
      end = (end || 0);
      
      var e = new eventObject(this,target,'copyWithin',this[target],undefined,arguments,'');
      
      if(_onevent(e) !== true && target < this.length)
      {
        target = (target < 0 ? (this.length-1) : target);
        start = (start < this.length ? start : (this.length-1));
        end = (end < this.length ? end : (this.length-1));
        start = (start < 0 ? (this.length-1) : start);
        end = (start < 0 ? (this.length-1) : end);
        
        for(var x=start;x<=end;x++)
        {
          this[(target+(x-start))] = this[x];
        }
        e.type = 'postcopyWithin';
        _onevent(e);
      }
      return this;
    }

    function fill(value,start,end)
    {
      start = (start !== undefined ? Math.max(0,start) : 0);
      end = ((end !== undefined && end <= this.length) ? Math.min(this.length,Math.max(0,end)) : this.length);

      var e = new eventObject(this,_start,'fill',this[_start],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        for(var x=a.key;x<end;x++)
        {
            this[x] = value;
        }
        e.type = 'postfill';
        _onevent(e);
      }
      return this;
    }

    function pop()
    {
      var e = new eventObject(this,(this.length-1),'pop',this[(this.length-1)],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = this[(this.length-1)];
        delete this[(this.length-1)]
        e.type = 'postpop'
        _onevent(e);
        return _ret;
      }
      return null;
    }

    function push(v)
    {
      var e = new eventObject(this,(this.length),'push',v,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        this[this.length] = v;
        e.type = 'postpush';
        _onevent(e);
      }
      return this.length;
    }

    function reverse()
    {
      var e = new eventObject(this,undefined,'reverse',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _rev = this.slice().reverse();
        for(var x=0,len=this.length;x<len;x++)
        {
            this[x] = _rev[x];
        }
        e.type = 'postreverse';
        _onevent(e);
      }
      return this;
    }

    function shift()
    {
      var e = new eventObject(this,0,'shift',this[0],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = this[a.key];
        for(var x=a.key,len=(this.length-1);x<len;x++)
        {
            this[x] = this[(x+1)];
        }
        delete this[(this.length-1)]
        e.type = 'postshift';
        _onevent(e);
      }
      return null;
    }

    function sort()
    {
      var e = new eventObject(this,undefined,'sort',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _sort = this.slice();
        _sort = _sort.sort.apply(_sort,arguments);
        for(var x=0,len=this.length;x<len;x++)
        {
            this[x] = _sort[x];
        }
        e.type = 'postsort';
        _onevent(e);
      }
      return this;
    }

    function splice(index,remove,insert)
    {
      var e = new eventObject(this,index,'splice',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = [],
            _inserts = Array.prototype.slice.call(arguments,2),
            _insertLen = (_inserts.length-2),
            _index = 0;

        if(remove !== 0 && this[((index-1)+remove)] !== undefined)
        {
          for(var x=0,len=remove;x<len;x++)
          {
            _ret.push(this[index+x]);
            for(var i=(index+x),lenI=(this.length-1);i<lenI;i++)
            {
                this[i] = this[(i+1)];
            }
            delete this[(this.length-1)];
          }
        }
        if(_insertLen !== 0)
        {
          for(var x=0,len=_insertLen;x<len;x++)
          {
              _index = (index+(Math.min(1,x)));
              for(var i=this.length,lenI=_index;i>lenI;i--)
              {
                this[i] = this[(i-1)];
              }
              this[_index] = _inserts[x];
          }
        }
        e.type = 'postsplice';
        e.listener = '__kbupdatelistener';
        _onevent(e);
        return _ret;
      }
      else
      {
        return [];
      }
    }

    function unshift()
    {
      var e = new eventObject(this,0,'unshift',this[0],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var args = Array.prototype.slice.call(arguments);
        for(var x=((this.length-1)+args.length),len=args.length;x !== -1;x--)
        {
          if(x < len)
          {
              this[x] = args[x];
          }
          else
          {
            this[x] = this[(x-args.length)];
          }
        }
        e.type = 'postunshift';
        _onevent(e);
      }
      return this.length;
    }

    /* ENDREGION Array methods */

    /* REGION Event Listeners */

    function stopChange()
    {
      this._stopChange = true;
      return this;
    }
    
    function splitScopeString(scopeString)
    {
      return scopeString.split('.');
    }
    
    function setLayer(scopeString)
    {
      var scope = splitScopeString(scopeString);
      function rec(scope)
      {
        var key = scope[0];

        if(this[key] === undefined && (scope.length-1) !== 0) this[key] = Mixed({},this.__kbname,this,this.__kbscopeString+"."+key);

        if(!isMixed(this[key])) return this;

        if((scope.length-1) !== 0)
        {
          scope.shift();
          return rec.call(this[key],scope);
        }
        return this[key];
      }
      return rec.call(this,scope);
    }

    function getLayer(scopeString)
    {
      var scope = splitScopeString(scopeString);
      function rec(scope)
      {
        var key = scope[0];
        
        if(this[key] === undefined && (scope.length-1) !== 0) return null;

        if(!isMixed(this[key])) return this;
        
        if((scope.length-1) !== 0)
        {
          scope.shift();
          return rec.call(this[key],scope);
        }
        return this[key];
      }
      return rec.call(this,scope);
    }
    
    function addListener(type,listener)
    {
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var _listeners = this[listener],
            e = new eventObject(this,listener,'addlistener',_listeners,undefined,arguments,'');
        
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          prop = scopeString.pop();
          scopeString = scopeString.join(".");
          e.local = this.getLayer(scopeString);
          _listeners = e.local[listener];
          e.value = _listeners;
        }
        
        if(_onevent(e) !== true)
        {
          if(isObject.call(_listeners))
          {
            if(_listeners[prop] === undefined) _listeners[prop] = [];
            _listeners[prop].push(func);
            e.type ='postaddlistener'
            _onevent(e);
          }
          else if(isArray.call(_listeners))
          {
            if(typeof prop === 'function')
            {
              _listeners.push(prop);
              e.type ='postaddlistener'
              _onevent(e);
            }
          }
        }
        return this;
      }
    }

    function removeListener(type,listener)
    {
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var _listeners = this[listener],
            e = new eventObject(this,listener,'removelistener',_listeners,undefined,arguments,'');
        
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          scopeString.pop();
          scopeString.join(".");
          e.local = this.getLayer(scopeString);
          _listeners = e.local[listener];
          e.value = _listeners;
          
          prop = splitScopeString(prop).pop();
        }
        
        if(_onevent(e) !== true)
        {
          if(isObject.call(_listeners))
          {
            if(_listeners[prop] !== undefined)
            {
              for(var x=0,len=_listeners[prop].length;x<len;x++)
              {
                if(_listeners[prop][x].toString() === func.toString())
                {
                  _listeners[prop].splice(x,1);
                  e.type = 'postremovelistener';
                  _onevent(e);
                  break;
                }
              }
            }
          }
          else if(isArray.call(_listeners))
          {
            if(typeof prop === 'function')
            {
              for(var x=0,len=_listeners.length;x<len;x++)
              {
                if(_listeners[x].toString() === prop.toString())
                {
                  _listeners.splice(x,1);
                  e.type = 'postremovelistener';
                  _onevent(e);
                  break;
                }
              }
            }
          }
        }
        return this;
      }
    }

    function addActionListener(type,func)
    {
      if(this.__kbref.__kbevents[type] !== undefined)
      {
        this.__kbref.__kbevents[type].push(func);
      }
      return this;
    }

    function removeActionListener(type,func)
    {
      if(this.__kbref.__kbevents[type] !== undefined)
      {
        for(var x=0,len=this.__kbref.__kbevents[type];x<len;x++)
        {
          if(this.__kbref.__kbevents[type][x].toString() === func.toString())
          {
            this.__kbref.__kbevents[type].splice(x,1);
            break;
          }
        }
      }
      return this;
    }
    
    function addChildListener(type,listener)
    {
      function recAddListener(prop,func,listener)
      {
        var children = Object.keys(this,'all').filter((function(p){
          return (isMixed.call(this[p]));
        }).bind(this));
        
        var _local = this,
            _locProp = prop;
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          _locProp = scopeString.pop();
          scopeString = scopeString.join(".");
          
          _local = this.getLayer(scopeString);
          if(_local[listener][_locProp] === undefined) _local[listener][_locProp] = [];
          _local[listener][_locProp].push(func);
        }
        
        if(isObject.call(_local[listener]))
        {
          if(_local[listener][_locProp] === undefined) _local[listener][_locProp] = [];
          _local[listener][_locProp].push(func);
          if(_local.__kbpointers[_locProp] !== undefined)
          {
            if(_local.__kbpointers[_locProp][_locProp] === undefined) _local.__kbpointers[_locProp][_locProp] = [];
            _local.__kbpointers[_locProp][_locProp].push(_func);
          }
        }
        else
        {
          _local[listener].push(func);
        }

        for(var x=0,len=children.length;x<len;x++)
        {
          recAddListener.call(this[children[x]],prop,func,listener);
        }
      }
      
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var e = new eventObject(this,listener,'addchildlistener',undefined,undefined,arguments,'');
        if(_onevent(e) !== true)
        {
          recAddListener.call(this,prop,func,listener);
          e.type = 'postaddchildlistener';
          _onevent(e);
        }
        return this;
      }
    }
    
    function removeChildListener(type,listener)
    {
      function recRemoveListener(prop,func,listener)
      {
        var children = Object.keys(this,'all').filter((function(p){
          return (isMixed.call(this[p]));
        }).bind(this));
        
        var _local = this,
            _locProp = prop;
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          _locProp = scopeString.pop();
          scopeString.join(".");
          
          _local = this.getLayer(scopeString);
          if(_local[listener][prop] !== undefined)
          {
            for(var x=0,len=_local[listener][prop].length;x<len;x++)
            {
              if(_local[listener][prop][x].toString() === func.toString())
              {
                _local[listener][prop].splice(x,1);
                break;
              }
            }
          }
        }
        
        if(isObject.call(_local[listener]))
        {
          if(_local[listener][_locProp] !== undefined)
          {
            for(var x=0,len=_local[listener][_locProp].length;x<len;x++)
            {
              if(_local[listener][_locProp][x].toString() === func.toString())
              {
                _local[listener][_locProp].splice(x,1);
                break;
              }
            }
            if(_local.__kbpointers.indexOf(_locProp) !== -1)
            {
              if(_local[_locProp].__kbImmediateParent[listener][_locProp] !== undefined)
              {
                for(var x=0,len=_local[_locProp].__kbImmediateParent[listener][_locProp].length;x<len;x++)
                {
                  if(_local[_locProp].__kbImmediateParent[listener][_locProp][x].toString() === func.toString())
                  {
                    _local[_locProp].__kbImmediateParent[listener][_locProp].splice(x,1);
                    break;
                  }
                } 
              }
            }
          }
        }
        else
        {
          for(var x=0,len=_local[listener].length;x<len;x++)
          {
            if(_local[listener][x].toString() === func.toString())
            {
              _local[listener].splice(x,1);
              break;
            }
          }
        }

        for(var x=0,len=children.length;x<len;x++)
        {
          recRemoveListener.call(this[children[x]],prop,func,listener);
        }
      }
      
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var e = new eventObject(this,listener,'removechildlistener',undefined,undefined,arguments,'');
        if(_onevent(e) !== true)
        {
          recRemoveListener.call(this,prop,func,listener);
          e.type = 'postremovechildlistener';
          _onevent(e);
        }
        return this;
      }
    }

    function subscribe(prop,func)
    {
      if(this.__kbsubscribers[prop] === undefined) this.__kbsubscribers[prop] = [];
      this.__kbsubscribers[prop].push(func);
      return this;
    }

    function unsubscribe(prop,func)
    {
      if(this.__kbsubscribers[prop] !== undefined)
      {
        for(var x=0,len=this.__kbsubscribers[prop].length;x<len;x++)
        {
          if(this.__kbsubscribers[prop][x].toString() === func.toString())
          {
            this.__kbsubscribers[prop].splice(x,1);
            break;
          }
        }
      }
      return this;
    }

    function callSubscribers(prop,value,oldValue)
    {
      if(this.__kbsubscribers[prop] !== undefined)
      {
        for(var x=0,len = this.__kbsubscribers[prop].length;x<len;x++)
        {
          this.__kbsubscribers[prop].call(this,prop,value,oldValue);
        }
      }
      return this;
    }

    /* ENDREGION Event Listeners */

    Object.defineProperties(Mixed.prototype,{
      
      /* Helper methods */
      typeof:setDescriptor(function(v){return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();},false,true),
      sizeof:setDescriptor(sizeof,false,true),
      isObject:setDescriptor(isObject,false,true),
      isArray:setDescriptor(isArray,false,true),
      isMixed:setDescriptor(isMixed,false,true),
      isObservable:setDescriptor(isObservable,false,true),
      stringify:setDescriptor(stringify,false,true),
      getKeys:setDescriptor(getKeys,false,true),
      getIndexes:setDescriptor(getIndexes,false,true),
      keyCount:setCustomDescriptor(keyCount,false,true),
      indexCount:setCustomDescriptor(indexCount,false,true),
      count:setCustomDescriptor(count,false,true),
      
      /* Non destructive Array methods */
      concat:setDescriptor(Array.prototype.concat),
      every:setDescriptor(Array.prototype.every),
      filter:setDescriptor(Array.prototype.filter),
      find:setDescriptor(Array.prototype.find),
      findIndex:setDescriptor(Array.prototype.findIndex),
      forEach:setDescriptor(Array.prototype.forEach),
      includes:setDescriptor(Array.prototype.includes),
      indexOf:setDescriptor(Array.prototype.indexOf),
      join:setDescriptor(Array.prototype.join),
      lastIndexOf:setDescriptor(Array.prototype.lastIndexOf),
      map:setDescriptor(Array.prototype.map),
      reduce:setDescriptor(Array.prototype.reduce),
      reduceRight:setDescriptor(Array.prototype.reduceRight),
      slice:setDescriptor(Array.prototype.slice),
      some:setDescriptor(Array.prototype.some),
      entries:setDescriptor(Array.prototype.entries),
      toLocaleString:setDescriptor(Array.prototype.toLocaleString),

      /* Object Methods */
      add:setDescriptor(add),
      set:setDescriptor(set),
      get:setDescriptor(get),
      del:setDescriptor(del),
      exists:setDescriptor(exists),
      addPrototype:setDescriptor(addPrototype),
      addPointer:setDescriptor(addPointer),
      move:setDescriptor(move),
      copy:setDescriptor(copy),
      merge:setDescriptor(merge),

      /* Array Methods */
      copyWithin:setDescriptor(copyWithin),
      fill:setDescriptor(fill),
      pop:setDescriptor(pop),
      push:setDescriptor(push),
      reverse:setDescriptor(reverse),
      shift:setDescriptor(shift),
      sort:setDescriptor(sort),
      splice:setDescriptor(splice),
      unshift:setDescriptor(unshift),
      
      /* Helpers */
      getLayer:setDescriptor(getLayer),
      setLayer:setDescriptor(setLayer),
      ignoreCreate:setDescriptor(ignoreCreate),
      
      /* Event Listeners */
      addActionListener:setDescriptor(addActionListener),
      removeActionListener:setDescriptor(removeActionListener),
      subscribe:setDescriptor(subscribe),
      unsubscribe:setDescriptor(unsubscribe),
      callSubscribers:setDescriptor(callSubscribers),
      stopChange:setDescriptor(stopChange)
    });
    
    
    Object.defineProperties(Mixed.prototype,{
      
      /* Standard Data Listeners as a single layer */
      addDataListener:setDescriptor(addListener('addDataListener','__kblisteners')),
      removeDataListener:setDescriptor(removeListener('removeDataListener','__kblisteners')),
      addDataUpdateListener:setDescriptor(addListener('addDataUpdateListener','__kbupdatelisteners')),
      removeDataUpdateListener:setDescriptor(removeListener('removeDataUpdateListener','__kbupdatelisteners')),
      addDataCreateListener:setDescriptor(addListener('addDataCreateListener','__kbcreatelisteners')),
      removeDataCreateListener:setDescriptor(removeListener('removeDataCreateListener','__kbcreatelisteners')),
      addDataDeleteListener:setDescriptor(addListener('addDataDeleteListener','__kbdeletelisteners')),
      removeDataDeleteListener:setDescriptor(removeListener('removeDataDeleteListener','__kbdeletelisteners')),
      
      /* MultiLayer Child Listeners */
      addChildDataListener:setDescriptor(addChildListener('addChildDataListener','__kbparentlisteners')),
      removeChildDataListener:setDescriptor(removeChildListener('removeChildDataListener','__kbparentlisteners')),
      addChildDataUpdateListener:setDescriptor(addChildListener('addChildDataUpdateListener','__kbparentupdatelisteners')),
      removeChildDataUpdateListener:setDescriptor(removeChildListener('removeChildDataUpdateListener','__kbparentupdatelisteners')),
      addChildDataCreateListener:setDescriptor(addChildListener('addChildDataCreateListener','__kbparentcreatelisteners')),
      removeChildDataCreateListener:setDescriptor(removeChildListener('removeChildDataCreateListener','__kbparentcreatelisteners')),
      addChildDataDeleteListener:setDescriptor(addChildListener('addChildDataDeleteListener','__kbparentdeletelisteners')),
      removeChildDataDeleteListener:setDescriptor(removeChildListener('removeChildDataDeleteListener','__kbparentdeletelisteners')),
    });

    return Mixed;
  }
  return CreateKonnektDT;
});
