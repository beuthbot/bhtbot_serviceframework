export default class GatewayAnswer {
  history: string[];
  content?: string;
  error?: string;
  cacheable: boolean = true;

  public setContent(content: string){
    this.content = content;
    return this;
  }
  public setError(error: string){
    this.error = error;
    return this;
  }
  public setHistory(history: string[]){
    this.history = history;
    return this;
  }
  public addHistory(name: string){
    if(!this.history){
      this.history = [];
    }
    this.history.push(name);
    return this;
  }
  public setCacheable(cacheable: boolean){
    this.cacheable = cacheable;
    return this;
  }
}
