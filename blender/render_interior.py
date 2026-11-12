"""Offline Blender look-back preview. Does not launch the web server."""
import bpy,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'blender','little-quarter.blend'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.world.use_nodes=True;bg=scene.world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(.3,.34,.31,1);bg.inputs['Strength'].default_value=.35
camera=scene.camera;camera.location=(60,7.5,1.8);camera.rotation_euler=(Vector((60,-1,2.35))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=22
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,'analysis','interior-lookback.png');bpy.ops.render.render(write_still=True)
