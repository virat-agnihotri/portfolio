"""Run with Blender --background --python blender/build_neighborhood.py.
Builds an editable neighborhood and exports the browser-ready scene.
"""
import bpy, math, random, os
from mathutils import Vector
random.seed(27)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
palette={'paper':'f1e4cd','cream':'ddc9a5','pink':'cb8975','teal':'42786c','blue':'748e9c','yellow':'d6af65','ink':'293c37','wood':'91674a','roof':'9d5c46','leaf':'709159','darkleaf':'496c48','glass':'41645f','road':'a39a88','stone':'c8baa0','white':'fff4dc','orange':'cf8154','leaflight':'91a66b','brick':'ae7057','metal':'394740','lampglass':'ffdca1','moss':'7b8356'}
materials={}
for name,value in palette.items():
    srgb=[int(value[i:i+2],16)/255 for i in (0,2,4)]
    linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    m=bpy.data.materials.new(name);m.diffuse_color=tuple(linear)+(1,);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Roughness'].default_value=.9;materials[name]=m
def box(name,loc,size,color='cream',parent=None,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(materials[color]);o.parent=parent
    if bevel:mod=o.modifiers.new('Soft crafted edges','BEVEL');mod.width=bevel;mod.segments=1
    return o
def cyl(name,loc,r,depth,color='wood',verts=10,parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(materials[color]);o.parent=parent;return o
def ball(name,loc,scale,color='leaf',parent=None):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(materials[color]);o.parent=parent;return o
def text(name,body,loc,size=.32,color='ink',parent=None):
    # Text faces local -Y (the front of each facade).
    bpy.ops.object.text_add(location=loc,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=name;o.data.body=body;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.size=size;o.data.extrude=.002;o.data.materials.append(materials[color]);o.parent=parent
    bpy.ops.object.convert(target='MESH');return bpy.context.object
def tree(x,y,s=1):
    cyl('tree_trunk',(x,y,1.25*s),.16*s,2.5*s,verts=12)
    for angle in [0,2.1,4.2]:
        start=Vector((x,y,1.5*s));end=Vector((x+math.cos(angle)*.7*s,y+math.sin(angle)*.7*s,2.7*s));branch=cyl('branch',(start+end)/2,.07*s,(end-start).length,verts=8);branch.rotation_euler=(end-start).to_track_quat('Z','Y').to_euler()
    for i in range(9):
        angle=i*2.4;radius=.6+.3*random.random();dx=math.cos(angle)*radius;dy=math.sin(angle)*radius;dz=2.9+random.random()*.85
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=(x+dx*s,y+dy*s,dz*s));o=bpy.context.object;o.name='foliage';o.scale=((.8+random.random()*.4)*s,(.75+random.random()*.35)*s,(.8+random.random()*.45)*s);o.data.materials.append(materials[['leaf','darkleaf','leaflight'][i%3]])
        for polygon in o.data.polygons:polygon.use_smooth=True
    cyl('tree_grate',(x,y,.15),.68,.035,'metal',16)
def lamp(x,y):
    cyl('lamp_foot',(x,y,.16),.24,.3,'metal',12);cyl('lamp_base',(x,y,.42),.13,.65,'metal',12);cyl('lamp_post',(x,y,1.9),.065,3.4,'metal',12)
    for z in [.7,3.35]:cyl('lamp_collar',(x,y,z),.1,.1,'metal',12)
    box('lantern_glass',(x,y,3.77),(.32,.32,.53),'lampglass');box('lantern_base',(x,y,3.48),(.48,.48,.09),'metal')
    for dx in [-.18,.18]:
        for dy in [-.18,.18]:box('lantern_frame',(x+dx,y+dy,3.78),(.035,.035,.6),'metal')
    bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=.38,radius2=.09,depth=.25,location=(x,y,4.15),rotation=(0,0,math.pi/4));bpy.context.object.name='lantern_roof';bpy.context.object.data.materials.append(materials['metal'])
    ball('lantern_finial',(x,y,4.33),(.07,.07,.09),'metal')
def bench(x,y):
    for z in [.55,.85,1.1]:box('bench_plank',(x,y+(0 if z==.55 else .32),z),(1.7,.5 if z==.55 else .08,.11),'wood')
    for dx in [-.62,.62]:box('bench_leg',(x+dx,y,.28),(.09,.35,.55),'ink')

# Ground and patterned pedestrian street.
box('ground',(0,24,-.22),(100,100,.35),'cream')
box('avenue',(0,23,-.02),(8,83,.12),'road')
for side in [-1,1]:
    box('sidewalk',(side*5.3,23,.04),(2.6,83,.2),'stone')
    box('curb',(side*4.06,23,.13),(.16,83,.24),'paper')
    box('gutter',(side*3.88,23,.048),(.18,83,.024),'ink')
    for y in range(-16,65,2):box('curb_joint',(side*4.06,y,.255),(.17,.018,.012),'wood')
for side in [-1,1]:
    for y in [-3,13,29,45,57]:lamp(side*4.7,y);tree(side*5.9,y+2,.85)
    for y in [6,23,40]:bench(side*5.7,y)

def building(key,title,subtitle,x,y,rotation,color='cream',floors=2):
    root=bpy.data.objects.new(key,None);bpy.context.collection.objects.link(root)
    w=8;d=5;h={'gallery':7.5,'about':8.4,'studio':6.9,'contact':8,'cafe':4.7,'bookshop':7.8}.get(key,6.8)
    box(key+'_body',(0,0,h/2),(w,d,h),color,root)
    # Foundation, cornices, outlined facade bands.
    box('foundation',(0,-.04,.3),(w+.2,d+.15,.6),'stone',root)
    for z in [3.5,h-.12]:box('cornice',(0,0,z),(w+.3,d+.3,.18),'paper',root)
    box('roof',(0,0,h+.18),(w+.6,d+.6,.34),'roof',root)
    box('parapet_front',(0,-d/2,h+.5),(w+.4,.15,.6),color,root)
    for xx in [-w/2,w/2]:box('corner_trim',(xx,-d/2-.04,h/2),(.2,.12,h),'paper',root)
    box('chimney',(2.4,.8,h+.8),(.65,.6,1.3),'pink',root)
    box('chimney_cap',(2.4,.8,h+1.5),(.82,.76,.14),'paper',root)
    # Recessed-looking window trim, shutters, rainwater pipes, and worn brickwork.
    for xx in [-3.7,3.7]:
        cyl('drainpipe',(xx,-2.68,h*.47),.055,h*.9,'metal',8,root)
        for zz in [1.1,3.4,5.9]:box('pipe_clip',(xx,-2.7,zz),(.18,.08,.08),'metal',root)
    for row in range(3):
        for j in range(4):box('exposed_brick',(-3.45+j*.36+(row%2)*.15,-2.515,.46+row*.17),(.32,.025,.125),'brick',root)
    if key in ['about','bookshop']:
        # Pitched terracotta roof, with a clear ridge and narrow tiled bands.
        verts=[(-4.35,-2.85,h+.15),(4.35,-2.85,h+.15),(-4.35,0,h+2.05),(4.35,0,h+2.05),(-4.35,2.85,h+.15),(4.35,2.85,h+.15)]
        mesh=bpy.data.meshes.new('pitched_roof');mesh.from_pydata(verts,[],[(0,1,3,2),(2,3,5,4),(0,2,4),(1,5,3)]);o=bpy.data.objects.new('pitched_roof',mesh);bpy.context.collection.objects.link(o);o.parent=root;o.data.materials.append(materials['roof'])
        for yy in [-2.2,-1.5,-.8,.8,1.5,2.2]:box('roof_tile_course',(0,yy,h+2.05-abs(yy)*1.9/2.85),(8.6,.05,.05),'brick',root)
    if key=='studio':
        # Workshop clerestory roof gives the makers' building its own silhouette.
        box('clerestory',(0,.3,h+.75),(5.7,2.8,1.25),'brick',root)
        for xx in [-2,-1,0,1,2]:box('clerestory_glass',(xx,-1.13,h+.8),(.75,.06,.7),'glass',root)
        box('clerestory_cap',(0,.3,h+1.45),(6.2,3.1,.18),'metal',root)
    if key=='contact':
        box('civic_pediment',(0,-2.6,h+.7),(4.3,.4,.75),'paper',root)
        # Civic clock and hands.
        clock=cyl('clock_face',(0,-2.86,h+.76),.58,.08,'paper',32,root);clock.rotation_euler.x=math.pi/2
        box('clock_hand',(0,-2.93,h+.94),(.035,.04,.39),'ink',root)
        hand=box('clock_hand',(.14,-2.94,h+.72),(.33,.04,.035),'ink',root);hand.rotation_euler.y=-.35
    # The door and two broad display windows.
    box('door_frame',(0,-2.57,1.45),(1.5,.2,2.75),'paper',root)
    box('door_'+key,(0,-2.7,1.4),(1.22,.11,2.55),'ink',root)
    box('door_glass',(0,-2.77,1.82),(.91,.04,1.3),'glass',root)
    ball('brass_handle',(.39,-2.85,1.15),(.06,.06,.06),'yellow',root)
    box('door_step',(0,-2.95,.14),(1.8,.7,.22),'paper',root)
    for xx in [-2.5,2.5]:
        box('display_frame',(xx,-2.57,1.5),(2.35,.19,2.05),'paper',root)
        box('display_glass',(xx,-2.69,1.5),(2.12,.08,1.81),'glass',root)
        for offset in [-.57,.57]:box('window_mullion',(xx+offset,-2.75,1.5),(.045,.06,1.85),'paper',root)
        box('display_sill',(xx,-2.77,.45),(2.5,.35,.16),'paper',root)
        if key in ['gallery','studio','bookshop']:
            for k in range(3):box('window_poster',(xx+(k-1)*.58,-2.78,1.5),(.42,.045,.65),['pink','yellow','cream'][k],root)
    # Striped fabric awning across storefront.
    for i in range(16):
        xx=-3.75+i*.5;a=box('awning',(xx,-3.15,3.08),(.5,1.25,.11),color if i%2 else 'paper',root);a.rotation_euler.x=.16
        box('awning_valance',(xx,-3.75,2.92),(.5,.09,.3),color if i%2 else 'paper',root)
    box('shop_sign',(0,-2.7,3.82),(6.9,.22,.75),'paper',root)
    text('sign_'+key,title,(0,-2.84,3.86),.46,'ink',root)
    if floors==2:
        for xx in [-2.5,0,2.5]:
            box('upper_window_frame',(xx,-2.57,5.35),(1.45,.18,1.8),'paper',root)
            box('upper_window',(xx,-2.68,5.35),(1.18,.08,1.53),'glass',root)
            box('upper_window_cross',(xx,-2.75,5.35),(1.2,.04,.055),'paper',root)
            box('upper_window_cross',(xx,-2.75,5.35),(.055,.04,1.55),'paper',root)
            if key in ['about','bookshop','cafe']:
                for side in [-1,1]:
                    box('shutter',(xx+side*.93,-2.7,5.35),(.38,.14,1.68),'teal',root)
                    for zz in [4.8,5.1,5.4,5.7]:box('shutter_slat',(xx+side*.93,-2.79,zz),(.3,.04,.04),'darkleaf',root)
            box('window_box',(xx,-2.86,4.45),(1.65,.5,.32),'wood',root)
            for k in range(4):ball('window_plant',(xx-.55+k*.36,-2.88,4.7),(.25,.22,.22),'leaf',root)
        if key in ['gallery','about']:
            box('balcony_floor',(0,-3.1,4.4),(2.2,1,.16),'stone',root)
            for k in range(9):box('balcony_rail',(-1+k*.25,-3.55,4.85),(.035,.035,.8),'metal',root)
            box('balcony_top',(0,-3.55,5.28),(2.25,.07,.07),'metal',root)
            for xx in [-1.08,1.08]:box('balcony_side',(xx,-3.1,5.28),(.05,.9,.05),'metal',root)
    # Projecting sign and little street board.
    box('sign_bracket',(-3.6,-3.2,4.5),(.08,1.5,.08),'ink',root)
    box('hanging_sign',(-3.6,-3.6,4.03),(.12,.85,.65),'yellow',root)
    box('a_board',(2,-3.75,.68),(.9,.12,1.1),'ink',root)
    text('board_label',subtitle,(2,-3.83,.72),.16,'paper',root)
    for xx in [-3.5,3.5]:
        cyl('planter',(xx,-2.95,.35),.3,.6,'pink',10,root)
        ball('topiary',(xx,-2.95,.95),(.45,.4,.55),'darkleaf',root)
    root.location=(x,y,0);root.rotation_euler.z=rotation
    return root

building('gallery','THE GALLERY','PROJECTS',9,4,-math.pi/2,'pink')
building('about','THE EXPLORER','MY STORY',-9,17,math.pi/2,'yellow')
building('studio','THE WORKSHOP','EXPERIMENTS',9,26,-math.pi/2,'teal')
building('contact','THE POST OFFICE','SAY HELLO',-9,39,math.pi/2,'blue')
building('cafe','SLOW DAYS CAFE','TAKE A BREAK',-9,-6,math.pi/2,'cream',1)
building('bookshop','PAPER & STORIES','GET LOST',9,47,-math.pi/2,'cream')
for x,y,c in [(-16,55,'pink'),(16,62,'yellow'),(-16,66,'teal')]:building('background','LITTLE QUARTER','EXPLORE',x,y,0,c)
# Cafe terrace tables, little stools, and an umbrella.
for y in [-9,-5]:
    cyl('cafe_table',(-4.3,y,.85),.55,.12,'paper');cyl('table_leg',(-4.3,y,.4),.055,.8,'ink')
    for dy in [-.85,.85]:cyl('cafe_stool',(-4.3,y+dy,.5),.26,.13,'wood');cyl('stool_leg',(-4.3,y+dy,.24),.04,.45,'ink')
# Square at the end of the avenue, fountain and a clock arch.
cyl('fountain_base',(0,55,.18),2.5,.35,'stone',24);cyl('fountain_basin',(0,55,.48),2,.4,'paper',24);cyl('water',(0,55,.7),1.8,.04,'teal',24);cyl('fountain_column',(0,55,1.2),.27,1.2,'stone');cyl('fountain_top',(0,55,1.8),.85,.18,'paper',20)
for x in [-3.5,3.5]:box('arch_column',(x,63,3),(.65,.7,6),'cream')
box('arch_top',(0,63,6),(7.6,.8,.8),'cream');text('quarter_sign','THE LITTLE QUARTER',(0,62.55,6.05),.4)
for x in [-18,18]:
    for y in range(-10,76,10):tree(x,y,1.4)
# String lights strung over the street, sagging between buildings.
for y in [0,20,42]:
    pts=[]
    for i in range(21):
        x=-7+i*.7;z=5.6-1.1*math.sin(i/20*math.pi);pts.append((x,y,z))
        if i%2==0:ball('festoon_bulb',(x,y,z-.15),(.085,.085,.12),'yellow')
    curve=bpy.data.curves.new('festoon_wire','CURVE');curve.dimensions='3D';curve.bevel_depth=.012;s=curve.splines.new('POLY');s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new('festoon_wire',curve);bpy.context.collection.objects.link(o);o.data.materials.append(materials['ink']);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)

# Four actual interiors, placed off the street for instant room transitions.
for idx,key in enumerate(['gallery','about','studio','contact']):
    x=60+idx*22;y=5
    box(key+'_floor',(x,y,-.05),(13,15,.2),'wood')
    box(key+'_back_wall',(x,12.5,2.4),(13,.2,4.8),'paper')
    for side in [-1,1]:box(key+'_side_wall',(x+side*6.5,y,2.4),(.2,15,4.8),'cream')
    for yy in range(-2,13):box('floor_seam',(x,yy,.06),(13,.025,.01),'cream')
    text('room_title',{'gallery':'A FEW THINGS I MADE.','about':'CURIOSITY LIVES HERE.','studio':'ALWAYS IN THE MAKING.','contact':'THE NEXT CHAPTER.'}[key],(x,12.35,3.9),.48)
    text('room_subtitle',{'gallery':'SELECT A FRAME TO OPEN A PROJECT','about':'A LITTLE ABOUT THE PERSON BEHIND THE WORK','studio':'TOOLS, EXPERIMENTS & UNFINISHED IDEAS','contact':'GOOD THINGS START WITH A CONVERSATION'}[key],(x,12.33,3.22),.15)
    if key=='gallery':
        for j in range(3):
            xx=x+(j-1)*3.5
            box('project_frame_'+str(j),(xx,12.25,2),(2.65,.2,2.4),'ink')
            box('project_art_'+str(j),(xx,12.1,2.15),(2.4,.08,1.7),['teal','pink','yellow'][j])
            text('project_label', ['01 / WEATHER STATION','02 / SUPPLY STUDIO','03 / AI OUTPOST'][j],(xx,12.03,.98),.16,'paper')
            cyl('display_pedestal',(xx,8,.5),.65,1,'stone',8)
            ball('exhibit',(xx,8,1.35),(.55,.55,.55),['teal','pink','yellow'][j])
    elif key=='about':
        box('journal_table',(x,8,1),(5,2.1,.2),'wood')
        for dx in [-2.1,2.1]:box('table_support',(x+dx,8,.5),(.15,1.7,1),'ink')
        book=box('about_journal',(x,7.5,1.15),(1.8,1.3,.12),'yellow');book.rotation_euler.z=.16
        # Skills exhibition: keep the carpet and wall displays free of trees.
    elif key=='studio':
        for dx in [-3,3]:
            box('workbench',(x+dx,9,1),(4,1.4,.18),'wood')
            for h in [1.8,2.6]:box('shelf',(x+dx,12,h),(4,.65,.12),'wood')
            for k in range(7):box('book',(x+dx-1.4+k*.45,11.9,2.1),(.25,.3,.6),['pink','teal','yellow'][k%3])
        box('monitor',(x,10,1.9),(2.2,.2,1.5),'ink');box('monitor_screen',(x,9.88,1.9),(1.95,.03,1.25),'teal');box('monitor_desk',(x,10,1),(3,1.4,.15),'wood')
    else:
        box('post_counter',(x,9,.7),(7,1.5,1.4),'teal')
        for j in range(3):box('letter',(x-2+j*2,8.8,1.45),(1.3,.7,.035),'paper')
        for j in range(8):box('mailbox',(x-4.8+(j%4)*.7,12,1.5+(j//4)*.9),(.6,.6,.7),'yellow')
    for dx in ([] if key=='about' else [-5,5]):
        cyl('room_planter',(x+dx,10,.4),.4,.8,'pink');ball('room_plant',(x+dx,10,1.3),(.6,.5,.8),'leaf')

# Useful camera and lighting for opening the source in Blender.
bpy.ops.object.camera_add(location=(0,-15,2.2));cam=bpy.context.object;cam.name='Street eye-level camera';direction=Vector((0,20,2.5))-cam.location;cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='SUN',location=(0,0,20));bpy.context.object.rotation_euler=(.4,-.5,-.3);bpy.context.object.data.energy=2
bpy.context.scene.world.color=(.7,.7,.65)
os.makedirs(os.path.join(ROOT,'dist','assets'),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','little-quarter.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'dist','assets','neighborhood.glb'),export_format='GLB',export_cameras=False,export_lights=False,export_apply=True)
print('NEIGHBORHOOD_EXPORT_COMPLETE')
