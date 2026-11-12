"""Add complete room envelopes and furnishings to the existing Blender source.
Run after build_neighborhood.py; safe to rerun without duplicating finishes.
"""
import bpy, math, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'blender','little-quarter.blend'))
old=bpy.data.collections.get('Interior finishes')
if old:
    for obj in list(old.objects):bpy.data.objects.remove(obj,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new('Interior finishes');bpy.context.scene.collection.children.link(collection)
def material(name,value):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True
    rgb=[int(value[i:i+2],16)/255 for i in (0,2,4)];rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    m.diffuse_color=(*rgb,1);bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*rgb,1);bs.inputs['Roughness'].default_value=.85;return m
mats={k:material('interior_'+k,v) for k,v in {'ceiling':'eee5d4','wall':'e2d4bd','trim':'bba586','green':'577563','blue':'607d86','pink':'b77d68','brass':'c8a76a','dark':'354d43','wood':'9b7452','linen':'c8baa0','lamp':'fff0c4','rug':'a1a38a','paper':'efe6d0'}.items()}
def box(name,x,y,z,w,d,h,mat):
    vertices=[(-w/2,-d/2,-h/2),(w/2,-d/2,-h/2),(w/2,d/2,-h/2),(-w/2,d/2,-h/2),(-w/2,-d/2,h/2),(w/2,-d/2,h/2),(w/2,d/2,h/2),(-w/2,d/2,h/2)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],[(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)]);mesh.materials.append(mats[mat]);o=bpy.data.objects.new(name,mesh);collection.objects.link(o);o.location=(x,y,z);return o
def cone(name,x,y,z,r1,r2,h,mat):
    n=20;vs=[(math.cos(i*2*math.pi/n)*r,math.sin(i*2*math.pi/n)*r,zz) for r,zz in [(r1,-h/2),(r2,h/2)] for i in range(n)];faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)];mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],faces);mesh.materials.append(mats[mat]);o=bpy.data.objects.new(name,mesh);collection.objects.link(o);o.location=(x,y,z);return o
for idx,key in enumerate(['gallery','about','studio','contact']):
    x=60+idx*22;accent={'gallery':'green','about':'pink','studio':'blue','contact':'green'}[key]
    box(key+'_ceiling',x,5,4.9,13.2,15.2,.24,'ceiling')
    box(key+'_entrance_wall',x,-2.5,2.4,13.2,.24,4.8,'wall')
    for side in [-1,1]:
        box(key+'_side_skirting',x+side*6.36,5,.21,.1,14.9,.3,'trim')
        box(key+'_side_paneling',x+side*6.37,5,.86,.06,14.9,1,'wall')
        box(key+'_side_dado',x+side*6.32,5,1.4,.11,14.9,.075,'trim')
        box(key+'_side_cornice',x+side*6.28,5,4.63,.25,14.9,.2,'ceiling')
        for y in [-1,1,3,5,7,9,11]:box(key+'_panel_stile',x+side*6.31,y,.86,.09,.06,1,'trim')
    for y in [-2.34,12.34]:
        box(key+'_end_skirting',x,y,.21,12.8,.09,.3,'trim')
        box(key+'_end_cornice',x,y,4.63,12.8,.25,.2,'ceiling')
    for y in [1.1,5.4,9.7]:box(key+'_ceiling_beam',x,y,4.68,12.6,.14,.13,'trim')
    # A real closed return door faces the room, masking the entrance wall behind it.
    box(key+'_exit_frame',x,-2.30,1.55,1.8,.16,3.1,'trim')
    box('interior_exit_'+key,x,-2.18,1.48,1.53,.12,2.9,'dark')
    for z in [.65,1.7,2.5]:box('interior_exit_'+key+'_panel',x,-2.105,z,1.23,.045,.45,accent)
    box('interior_exit_'+key+'_handle',x-.53,-2.04,1.35,.23,.07,.07,'brass')
    box(key+'_entry_mat',x,-1,.085,2.4,1.7,.025,'rug')
    for y in [2.1,7.4]:
        cone(key+'_light_canopy',x,y,4.7,.2,.2,.08,'brass')
        cone(key+'_pendant_wire',x,y,4.34,.018,.018,.62,'dark')
        cone(key+'_pendant_shade',x,y,3.95,.65,.18,.36,'lamp')
        cone(key+'_pendant_rim',x,y,3.77,.66,.66,.04,'brass')
        light_data=bpy.data.lights.new(key+'_interior_light','AREA');light_data.energy=350;light_data.color=(1,.86,.67);light_data.shape='DISK';light_data.size=3.5
        light=bpy.data.objects.new(key+'_interior_light',light_data);collection.objects.link(light);light.location=(x,y,3.65)
    if key=='gallery':
        # Low viewing bench leaves the center of the exhibition unobstructed.
        box('gallery_viewing_bench',x,4.4,.55,4.6,1,.19,'wood')
        for dx in [-1.9,1.9]:box('gallery_bench_leg',x+dx,4.4,.28,.12,.7,.55,'dark')
        for dx in [-4.8,-2.4,0,2.4,4.8]:box('gallery_picture_light',x+dx,12.05,3.55,1,.18,.08,'brass')
    elif key=='about':
        box('about_reading_rug',x,4.2,.085,5.6,4.6,.02,'rug')
        for dx in [-4.7,4.7]:
            box('about_armchair_seat',x+dx,4.5,.55,1.6,1.5,.35,'linen');box('about_armchair_back',x+dx,5.13,1.04,1.6,.23,1.2,accent)
            for arm in [-.73,.73]:box('about_armrest',x+dx+arm,4.5,.9,.18,1.5,.3,'wood')
        box('about_bookcase',x-5.7,8.4,1.55,.7,3.5,3,'wood')
        for z in [.55,1.3,2.05,2.8]:box('about_shelf',x-5.25,8.4,z,.5,3.3,.08,'trim')
        for i in range(12):box('about_spine',x-5.21,7+i*.25,2.43,.37,.15,.58,['green','pink','blue'][i%3])
    elif key=='studio':
        box('studio_pinboard_frame',x+6.22,5,2.65,.13,4.4,1.9,'wood');box('studio_pinboard',x+6.13,5,2.65,.05,4.2,1.7,'linen')
        for i in range(6):box('studio_pinned_note',x+6.08,3.6+(i%3)*1.25,2.2+(i//3)*.85,.025,.7,.55,['paper','pink','green'][i%3])
        box('studio_center_worktable',x,4.4,.95,3,1.8,.16,'wood')
        for dx in [-1.25,1.25]:box('studio_table_leg',x+dx,4.4,.48,.13,1.4,.96,'dark')
        for i in range(4):box('studio_notebook',x-.85+i*.55,4.4,1.08,.45,.65,.06,['paper','pink','green','blue'][i])
    else:
        box('contact_writing_desk',x+4.6,4.5,1,2.2,2.8,.14,'wood')
        for dx in [3.7,5.5]:box('contact_desk_leg',x+dx,4.5,.5,.12,2.4,1,'dark')
        for i in range(3):box('contact_envelope',x+4.6,3.8+i*.55,1.09,.8,.4,.025,'paper')
        for row in range(3):
            for col in range(4):box('contact_sorting_cubby',x-6.18,3.3+col*.8,1.3+row*.75,.45,.69,.61,'wood');box('contact_cubby_label',x-5.93,3.3+col*.8,1.2+row*.75,.03,.23,.09,'paper')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','little-quarter.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'dist','assets','neighborhood.glb'),export_format='GLB',export_cameras=False,export_lights=False,export_apply=True)
print('INTERIOR_FINISH_COMPLETE')
