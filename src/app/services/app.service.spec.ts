import {TestBed, inject, async} from '@angular/core/testing';
import {HttpModule, Http, XHRBackend, Response, ResponseOptions, BaseRequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {BucketService, AuthService, ItemService} from './app.service';

// test AuthService
describe('AuthService', ()=>{

    // create the testing environment for each test
    beforeEach(async(()=>{
        TestBed.configureTestingModule({
            providers: [
                AuthService, 
                MockBackend, 
                BaseRequestOptions,
                {
                    provide: Http, 
                    deps:[MockBackend, BaseRequestOptions],
                    useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions)
                    }
                }
            ],
            imports: [HttpModule],
        });
        TestBed.compileComponents();
    }));

    // test AuthService is successfully created
    it('should construct', async(inject(
    [AuthService, MockBackend], (authService, mockBackend) => {
        expect(authService).toBeDefined();
    })));

    // test user can login using saved email and password
    describe('authLogin', () => {
        const mockResponse = {
                'messages': "login_success",
                'user_token': "w3ed3rd3r.ee3www3ee.323der4gty5"
            };

        it('should login user', async(inject(
        [AuthService, MockBackend], (authService, mockBackend) => {

            mockBackend.connections.subscribe(conn => {
                conn.mockRespond(new Response(new ResponseOptions({ body: JSON.stringify(mockResponse) })));
            });

            const result = authService.authLogin("testuser1@testusers.com", "testuser1");

            result.subscribe(res => {
                expect(res).toEqual({
                        'messages': "login_success",
                        'user_token': "w3ed3rd3r.ee3www3ee.323der4gty5"
                });
            });
        })));
    });

});

// test BucketService
describe('BucketService', ()=>{

    // create the testing environment for each test
    beforeEach(async(()=>{
        TestBed.configureTestingModule({
            providers: [
                BucketService, 
                MockBackend, 
                BaseRequestOptions,
                {
                    provide: Http, 
                    deps:[MockBackend, BaseRequestOptions],
                    useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions)
                    }
                }
            ],
            imports: [HttpModule],
        });
        TestBed.compileComponents();
    }));

    // test BucketService is successfully created
    it('should construct', async(inject(
    [BucketService, MockBackend], (bucketService, mockBackend) => {
        expect(bucketService).toBeDefined();
    })));

    // test createBucket method creates a bucket list object
    describe('createBucket', () => {
        const mockResponse = {
            bucketlists: {
                'id': "1",
                'name': "new bucket",
                'date_created': "18/07/2017 12:02:04 GMT",
                'date_modified': "18/07/2017 12:02:04 GMT",
                'created_by': "1"
            }};

        it('should create a bucket list', async(inject(
        [BucketService, MockBackend], (bucketService, mockBackend) => {

            mockBackend.connections.subscribe(conn => {
                conn.mockRespond(new Response(new ResponseOptions({ body: JSON.stringify(mockResponse) })));
            });

            const result = bucketService.createBucket("new bucket");

            result.subscribe(res => {
                expect(res).toEqual({"bucketlists":{
                    id: "1",
                    name: "new bucket",
                    date_created: "18/07/2017 12:02:04 GMT",
                    date_modified: "18/07/2017 12:02:04 GMT",
                    created_by: "1"
                }});
            });
        })));
    });
});

// test ItemService
describe('ItemService', ()=>{

    // create the testing environment for each test
    beforeEach(async(()=>{
        TestBed.configureTestingModule({
            providers: [
                ItemService, 
                MockBackend, 
                BaseRequestOptions,
                {
                    provide: Http, 
                    deps:[MockBackend, BaseRequestOptions],
                    useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions)
                    }
                }
            ],
            imports: [HttpModule],
        });
        TestBed.compileComponents();
    }));

    // test ItemService is successfully created
    it('should construct', async(inject(
    [ItemService, MockBackend], (itemService, mockBackend) => {
        expect(itemService).toBeDefined();
    })));

    // test user can create bucket list item
    describe('createItem', () => {
        const mockResponse = {
                    'messages': 'create_item_success',
                    'item': {
                        'id': "1",
                        'name': "item 1",
                        'date_created': "18/07/2017 17:36:27 GMT",
                        'date_modified': "18/07/2017 17:36:27 GMT",
                        'done': "false",
                        'bucket_id': "1"
                    }
                };

        it('should create bucket list item', async(inject(
        [ItemService, MockBackend], (itemService, mockBackend) => {

            mockBackend.connections.subscribe(conn => {
                conn.mockRespond(new Response(new ResponseOptions({ body: JSON.stringify(mockResponse) })));
            });

            const result = itemService.createItem("1", "item 1");

            result.subscribe(res => {
                expect(res).toEqual({
                    'messages': 'create_item_success',
                    'item': {
                        'id': "1",
                        'name': "item 1",
                        'date_created': "18/07/2017 17:36:27 GMT",
                        'date_modified': "18/07/2017 17:36:27 GMT",
                        'done': "false",
                        'bucket_id': "1"
                    }
                });
            });
        })));
    });

});