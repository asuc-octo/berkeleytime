from flask import Flask, escape, request, render_template
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
import time

es = None
app = None


def maybe_create_index():
    if not es.indices.exists(index='catalog'):
        print('index doesn\'t exist')
        es.indices.create(index='catalog')
    else:
        print('index exists')


@app.route("/")
def index():
    return search()


@app.route('/search')
def search():
    return render_template('search.html')


@app.route('/results', methods=['GET'])
def search_and_serve():
    if request.method == 'POST':
        query = escape(request.form['query'])
        s = Search(using=es, index='catalog') \
            .query('match', title=query)
        res = s.execute()
        output = str("Got %d Hits: \n" % res['hits']['total']['value'])
        for hit in res['hits']['hits']:
            output += hit['_source']['title'] + ', '
        return 'Your query: ' + query + ' | Search Results: ' + output
    else:
        return 'Failed'


@app.route('/add')
def add_class():
    return render_template('index_class.html')


@app.route('/index_class', methods=['POST', 'GET'])
def index_class():
    if request.method == 'POST':
        title = escape(request.form['class_title'])
        doc = {'title': title}
        es.index(index='catalog', doc_type='class', body=doc)
        return 'Class indexed: ' + title
    else:
        return 'Failed'


if __name__ == '__main__':
    es = Elasticsearch(['elasticsearch'])
    # Wait for Elasticsearch to boot up
    while not es.ping():
        time.sleep(2)
    app = Flask(__name__)
    app.run(debug=True, host='0.0.0.0')
